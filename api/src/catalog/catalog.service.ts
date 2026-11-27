import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';
import { ensureDefaultUsers } from '../users/users.service.js';
import { CategoryTreeDto } from './dto/category-tree.dto.js';
import { LoadSummaryDto } from './dto/load-summary.dto.js';
import { classify, parseCsv, type ExistingProduct, type ParsedRow } from './load-csv.js';
import { CategoryMapper } from './mappers/category.mapper.js';
import { LoadMapper } from './mappers/load.mapper.js';

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
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
