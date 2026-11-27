import 'reflect-metadata';
import { ConflictException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { CatalogService } from './catalog.service.js';
import { ProductWriteDto } from './dto/product-write.dto.js';

const draft = {
  upcDescription: 'Leche',
  upcCode: '000000000099',
  categoryCode: 'LAC',
  subCategoryCode: 'LAC-LEC',
  dateAdded: '2026-01-15T14:30:00Z',
  updatedDate: '2026-01-15T14:30:00Z',
  addedBy: 'admin@prueba.local',
  modifiedBy: 'admin@prueba.local',
};

function messages(errors: { property: string; constraints?: Record<string, string> }[], property: string) {
  return Object.values(errors.find((error) => error.property === property)?.constraints ?? {});
}

describe('reglas de producto', () => {
  it('exige nombre, UPC, categoría y subcategoría', async () => {
    const errors = await validate(plainToInstance(ProductWriteDto, {}));
    expect(messages(errors, 'upcDescription')).toContain('El nombre es obligatorio.');
    expect(messages(errors, 'upcCode')).toContain('El UPC es obligatorio.');
    expect(messages(errors, 'categoryCode')).toContain('La categoría es obligatoria.');
    expect(messages(errors, 'subCategoryCode')).toContain('La subcategoría es obligatoria.');
  });

  it('rechaza un UPC que ya existe', async () => {
    const prisma = {
      product: { findUnique: vi.fn().mockResolvedValue({ id: 'otro' }) },
    };
    const service = new CatalogService(prisma as unknown as PrismaService, {} as PasswordHasher);
    await expect(service.createProduct(draft)).rejects.toBeInstanceOf(ConflictException);
    await expect(service.createProduct(draft)).rejects.toThrow('El UPC ya existe.');
  });
});
