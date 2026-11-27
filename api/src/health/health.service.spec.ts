import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  const prisma = { $queryRaw: vi.fn() };
  const service = new HealthService(prisma as unknown as PrismaService);

  it('reporta la API y la base cuando la conexión responde', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    await expect(service.check()).resolves.toEqual({ status: 'ok', api: 'up', database: 'up' });
  });

  it('responde 503 cuando la base no responde', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connect ECONNREFUSED'));
    await expect(service.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(service.check()).rejects.toMatchObject({
      response: { status: 'error', api: 'up', database: 'down' },
    });
  });
});
