import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const upc = '000000000099';

const productBody = {
  upcDescription: 'Producto de prueba',
  upcCode: upc,
  categoryCode: 'LAC',
  subCategoryCode: 'LAC-LEC',
  dateAdded: '2026-01-15T14:30:00Z',
  updatedDate: '2026-01-15T14:30:00Z',
  addedBy: 'admin@prueba.local',
  modifiedBy: 'admin@prueba.local',
};

describe('Productos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken = '';
  let managerToken = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    await request(app.getHttpServer()).post('/load');
    await prisma.product.deleteMany({ where: { upcCode: upc } });
    adminToken = await login('admin@prueba.local', 'Admin123!');
    managerToken = await login('manager@prueba.local', 'Manager123!');
  }, 30000);

  afterAll(async () => {
    await prisma.product.deleteMany({ where: { upcCode: upc } });
    await app.close();
  });

  async function login(username: string, password: string): Promise<string> {
    const response = await request(app.getHttpServer()).get('/auth/login').query({ username, password });
    return response.body.accessToken as string;
  }

  it('lista, crea, rechaza duplicados y borra', async () => {
    const anonymous = await request(app.getHttpServer()).get('/products');
    expect(anonymous.status).toBe(401);

    const missingFields = await request(app.getHttpServer())
      .post('/products')
      .send({ token: adminToken });
    expect(missingFields.status).toBe(400);
    expect(missingFields.body.message).toEqual(expect.any(String));

    const created = await request(app.getHttpServer())
      .post('/products')
      .send({ ...productBody, token: adminToken });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      upcCode: upc,
      upcDescription: 'Producto de prueba',
      categoryCode: 'LAC',
      subCategoryCode: 'LAC-LEC',
      dateAdded: '2026-01-15T14:30:00Z',
      updatedDate: '2026-01-15T14:30:00Z',
      needsAttention: false,
    });

    const list = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(list.status).toBe(200);
    expect(list.body.some((item: { upcCode: string }) => item.upcCode === upc)).toBe(true);

    const detail = await request(app.getHttpServer())
      .get(`/products/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(detail.status).toBe(200);
    expect(detail.body.addedBy).toBe('admin@prueba.local');

    const duplicate = await request(app.getHttpServer())
      .post('/products')
      .send({ ...productBody, token: adminToken, upcDescription: 'Otro' });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.message).toBe('El UPC ya existe.');

    const wrongCategory = await request(app.getHttpServer())
      .put(`/products/${created.body.id}`)
      .send({ ...productBody, token: adminToken, categoryCode: 'BEB' });
    expect(wrongCategory.status).toBe(400);
    expect(wrongCategory.body.message).toBe('La subcategoría no pertenece a la categoría.');

    const manager = await request(app.getHttpServer())
      .post('/products')
      .send({ ...productBody, token: managerToken, upcCode: '000000000098' });
    expect(manager.status).toBe(403);

    const missing = await request(app.getHttpServer())
      .get('/products/00000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(missing.status).toBe(404);
    expect(missing.body.message).toBe('No existe el producto.');

    const removed = await request(app.getHttpServer())
      .get(`/products/${created.body.id}/delete`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ token: adminToken });
    expect(removed.status).toBe(200);

    const gone = await request(app.getHttpServer())
      .get(`/products/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(gone.status).toBe(404);
  });
});
