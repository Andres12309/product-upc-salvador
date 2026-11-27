import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ensureDefaultUsers } from '../users/users.service.js';
import { CategoryItemDto } from './dto/category-item.dto.js';
import { CategoryTreeDto } from './dto/category-tree.dto.js';
import { LoadSummaryDto } from './dto/load-summary.dto.js';
import { ProductViewDto } from './dto/product-view.dto.js';
import { ProductWriteDto } from './dto/product-write.dto.js';
import { classify, parseCsv, type ExistingProduct, type ParsedRow } from './load-csv.js';
import { CategoryMapper } from './mappers/category.mapper.js';
import { LoadMapper } from './mappers/load.mapper.js';
import { ProductMapper } from './mappers/product.mapper.js';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async subcategories(categoryCode: string): Promise<CategoryTreeDto> {
    const code = categoryCode.trim().toUpperCase();
    const category = await this.prisma.category.findUnique({
      where: { code },
      include: {
        subcategories: {
          orderBy: { code: 'asc' },
          include: {
            products: {
              orderBy: { upcCode: 'asc' },
              select: {
                id: true,
                upcCode: true,
                upcDescription: true,
                needsAttention: true,
                attentionReason: true,
              },
            },
          },
        },
        pendingProducts: {
          orderBy: { upcCode: 'asc' },
          select: {
            id: true,
            upcCode: true,
            upcDescription: true,
            needsAttention: true,
            attentionReason: true,
          },
        },
      },
    });
    if (!category) throw new NotFoundException(`No existe la categoría ${code}`);
    return CategoryMapper.toTree(category);
  }

  async load(): Promise<LoadSummaryDto> {
    const path = join(process.cwd(), '../data/productos.csv');
    let text: string;
    try {
      text = await readFile(path, 'utf8');
    } catch {
      throw new BadRequestException('No se encontró data/productos.csv');
    }

    let parsed: ParsedRow[];
    try {
      parsed = parseCsv(text);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'El CSV no se pudo leer');
    }

    await ensureDefaultUsers(this.prisma, this.passwordHasher);

    const saved = await this.prisma.$transaction(async (tx) => {
      const current = await tx.product.findMany({
        select: {
          upcCode: true,
          upcDescription: true,
          dateAdded: true,
          updatedDate: true,
          addedBy: true,
          modifiedBy: true,
          attentionReason: true,
          subcategory: { select: { code: true, category: { select: { code: true } } } },
          category: { select: { code: true } },
        },
      });
      const existing: ExistingProduct[] = current.map((product) => ({
        upcCode: product.upcCode,
        upcDescription: product.upcDescription,
        categoryCode: product.subcategory?.category.code ?? product.category?.code ?? null,
        subcategoryCode: product.subcategory?.code ?? null,
        dateAdded: product.dateAdded,
        updatedDate: product.updatedDate,
        addedBy: product.addedBy,
        modifiedBy: product.modifiedBy,
        attentionReason: product.attentionReason,
      }));
      const result = classify(parsed, existing);

      const categoryIds = new Map<string, string>();
      let categories = 0;
      const categoryCodes = unique([
        ...result.pairs.map((pair) => pair.categoryCode),
        ...result.pendingCategories,
      ]);
      for (const code of categoryCodes) {
        const found = await tx.category.findUnique({ where: { code }, select: { id: true } });
        if (found) {
          categoryIds.set(code, found.id);
          continue;
        }
        const created = await tx.category.create({ data: { code }, select: { id: true } });
        categoryIds.set(code, created.id);
        categories += 1;
      }

      const subcategoryIds = new Map<string, string>();
      let subcategories = 0;
      const subcategoriesToCreate = new Map<string, string>();
      for (const pair of result.pairs) subcategoriesToCreate.set(pair.subcategoryCode, pair.categoryCode);
      for (const [code, categoryCode] of subcategoriesToCreate) {
        const found = await tx.subcategory.findUnique({ where: { code }, select: { id: true } });
        if (found) {
          subcategoryIds.set(code, found.id);
          continue;
        }
        const categoryId = categoryIds.get(categoryCode);
        if (!categoryId) throw new Error(`Falta la categoría ${categoryCode}`);
        const created = await tx.subcategory.create({
          data: { code, categoryId },
          select: { id: true },
        });
        subcategoryIds.set(code, created.id);
        subcategories += 1;
      }

      if (result.inserted.length > 0) {
        await tx.product.createMany({
          data: result.inserted.map((row) => {
            const subcategoryId = row.subcategoryCode ? (subcategoryIds.get(row.subcategoryCode) ?? null) : null;
            if (row.subcategoryCode && !subcategoryId) throw new Error(`Falta la subcategoría ${row.subcategoryCode}`);
            const categoryId =
              row.subcategoryCode || !row.categoryCode ? null : (categoryIds.get(row.categoryCode) ?? null);
            if (!row.subcategoryCode && row.categoryCode && !categoryId) {
              throw new Error(`Falta la categoría ${row.categoryCode}`);
            }
            return {
              upcCode: row.upcCode,
              upcDescription: row.upcDescription,
              subcategoryId,
              categoryId,
              needsAttention: row.needsAttention,
              attentionReason: row.attentionReason ?? null,
              dateAdded: row.dateAdded ? new Date(row.dateAdded) : null,
              updatedDate: row.updatedDate ? new Date(row.updatedDate) : null,
              addedBy: row.addedBy,
              modifiedBy: row.modifiedBy,
            };
          }),
        });
      }

      for (const conflict of result.conflicts) {
        const product = await tx.product.findUnique({
          where: { upcCode: conflict.upcCode },
          select: { attentionReason: true },
        });
        if (!product) throw new Error(`Falta el producto ${conflict.upcCode}`);
        const marker = conflict.reason.match(/Id \d+:/)?.[0];
        if (marker && product.attentionReason?.includes(marker)) continue;
        const attentionReason = product.attentionReason
          ? `${product.attentionReason}. ${conflict.reason}`
          : conflict.reason;
        await tx.product.update({
          where: { upcCode: conflict.upcCode },
          data: { needsAttention: true, attentionReason },
        });
      }

      return { categories, subcategories, products: result.inserted.length, rows: result.rows };
    });

    return LoadMapper.toSummary(saved);
  }

  async categories(): Promise<CategoryItemDto[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { code: 'asc' }, select: { code: true } });
    return rows.map((row) => CategoryMapper.toItem(row.code));
  }

  async products(): Promise<ProductViewDto[]> {
    const rows = await this.prisma.product.findMany({
      orderBy: { upcDescription: 'asc' },
      include: productInclude,
    });
    return rows.map((row) => ProductMapper.toView(row));
  }

  async product(id: string): Promise<ProductViewDto> {
    const row = await this.findProduct(id);
    return ProductMapper.toView(row);
  }

  async createProduct(input: ProductWriteDto): Promise<ProductViewDto> {
    const data = await this.productData(input);
    try {
      const row = await this.prisma.product.create({ data, include: productInclude });
      return ProductMapper.toView(row);
    } catch (error) {
      throw upcConflict(error);
    }
  }

  async updateProduct(id: string, input: ProductWriteDto): Promise<ProductViewDto> {
    await this.findProduct(id);
    const data = await this.productData(input, id);
    try {
      const row = await this.prisma.product.update({ where: { id }, data, include: productInclude });
      return ProductMapper.toView(row);
    } catch (error) {
      throw upcConflict(error);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await this.findProduct(id);
    await this.prisma.product.delete({ where: { id } });
  }

  private async findProduct(id: string) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new NotFoundException('No existe el producto.');
    }
    const row = await this.prisma.product.findUnique({ where: { id }, include: productInclude });
    if (!row) throw new NotFoundException('No existe el producto.');
    return row;
  }

  private async productData(input: ProductWriteDto, ignoreId?: string) {
    const taken = await this.prisma.product.findUnique({
      where: { upcCode: input.upcCode },
      select: { id: true },
    });
    if (taken && taken.id !== ignoreId) throw new ConflictException('El UPC ya existe.');

    const subcategory = await this.prisma.subcategory.findUnique({
      where: { code: input.subCategoryCode },
      select: { id: true, category: { select: { code: true } } },
    });
    if (!subcategory) throw new BadRequestException('La subcategoría no existe.');
    if (subcategory.category.code !== input.categoryCode) {
      throw new BadRequestException('La subcategoría no pertenece a la categoría.');
    }

    return {
      upcCode: input.upcCode,
      upcDescription: input.upcDescription,
      subcategoryId: subcategory.id,
      categoryId: null,
      needsAttention: false,
      attentionReason: null,
      dateAdded: parseUtc(input.dateAdded),
      updatedDate: parseUtc(input.updatedDate),
      addedBy: input.addedBy,
      modifiedBy: input.modifiedBy,
    };
  }
}

const productInclude = {
  subcategory: { select: { code: true, category: { select: { code: true } } } },
  category: { select: { code: true } },
} as const;

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function parseUtc(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/.exec(value);
  if (!match) throw new BadRequestException('La fecha no es válida.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const utc = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const real =
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day &&
    hour <= 23 &&
    minute <= 59 &&
    second <= 59;
  if (!real) throw new BadRequestException('La fecha no es válida.');
  return utc;
}

function upcConflict(error: unknown): unknown {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return new ConflictException('El UPC ya existe.');
  }
  return error;
}
