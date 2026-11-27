import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Carga (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.product.deleteMany();
    await prisma.subcategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('carga el CSV, no duplica al repetir y deja las dos cuentas', async () => {
    const first = await request(app.getHttpServer()).post('/load');
    expect(first.status).toBe(200);
    expect(first.body.products).toBeGreaterThan(0);
    expect(first.body.categories).toBeGreaterThan(0);
    expect(first.body.subcategories).toBeGreaterThan(0);
    expect(first.body.attention).toBeGreaterThan(0);
    expect(first.body.rows).toHaveLength(120);
    expect(await prisma.product.count()).toBe(first.body.products);

    const stored = await prisma.product.findUnique({ where: { upcCode: '010433218194' } });
    expect(stored?.upcCode).toBe('010433218194');
    expect(stored?.needsAttention).toBe(false);

    const shortUpc = await prisma.product.findUnique({ where: { upcCode: '10433218194' } });
    expect(shortUpc?.needsAttention).toBe(true);

    const cereal = await prisma.product.findUnique({ where: { upcCode: '930103105183' } });
    expect(cereal?.upcDescription).toBe('Cereal Maíz Azucarado 500g, Pack 2');
    expect(cereal?.needsAttention).toBe(true);

    const pending = await prisma.product.findUnique({ where: { upcCode: '814893252886' } });
    expect(pending?.subcategoryId).toBeNull();
    expect(pending?.needsAttention).toBe(true);

    const conflict = await prisma.product.findUnique({ where: { upcCode: '731135748917' } });
    expect(await prisma.product.count({ where: { upcCode: '731135748917' } })).toBe(1);
    expect(conflict?.needsAttention).toBe(true);
    expect(conflict?.attentionReason).toContain('Id 101:');

    const login = await request(app.getHttpServer())
      .get('/auth/login')
      .query({ username: 'admin@prueba.local', password: 'Admin123!' });
    const token = login.body.accessToken as string;

    const anonymous = await request(app.getHttpServer()).get('/categories/LAC/subcategories');
    expect(anonymous.status).toBe(401);

    const tree = await request(app.getHttpServer())
      .get('/categories/LAC/subcategories')
      .set('Authorization', `Bearer ${token}`);
    expect(tree.status).toBe(200);
    expect(tree.body.code).toBe('LAC');
    const milk = tree.body.subcategories.find((item: { code: string }) => item.code === 'LAC-LEC');
    expect(milk.categoryCode).toBe('LAC');
    expect(milk.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ upcCode: '166978480180', needsAttention: true }),
      ]),
    );

    const snacks = await request(app.getHttpServer())
      .get('/categories/snk/subcategories')
      .set('Authorization', `Bearer ${token}`);
    expect(snacks.status).toBe(200);
    expect(snacks.body.pending).toEqual(
      expect.arrayContaining([expect.objectContaining({ upcCode: '814893252886', needsAttention: true })]),
    );

    const missing = await request(app.getHttpServer())
      .get('/categories/NOPE/subcategories')
      .set('Authorization', `Bearer ${token}`);
    expect(missing.status).toBe(404);

    const second = await request(app.getHttpServer()).post('/load');
    expect(second.status).toBe(200);
    expect(second.body.products).toBe(0);
    expect(second.body.categories).toBe(0);
    expect(second.body.subcategories).toBe(0);
    expect(second.body.attention).toBe(0);
    expect(second.body.omitted).toBe(120);

    const admin = await prisma.user.findUnique({ where: { username: 'admin@prueba.local' } });
    const manager = await prisma.user.findUnique({ where: { username: 'manager@prueba.local' } });
    expect(admin?.role).toBe('admin');
    expect(manager?.role).toBe('manager');
    expect(admin?.passwordHash.startsWith('$scrypt$')).toBe(true);
    expect(admin?.passwordHash).not.toContain('Admin123!');
  });
});
