import { Controller, HttpCode, Post } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { Permissions } from '../src/common/constants/permissions.constant.js';
import { RequirePermissions } from '../src/common/decorators/require-permissions.decorator.js';
import { configureApp } from '../src/configure-app.js';

@Controller('access-check')
class AccessCheckController {
  @Post()
  @HttpCode(200)
  @RequirePermissions(Permissions.PRODUCTS.WRITE)
  write(): { ok: true } {
    return { ok: true };
  }
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [AccessCheckController],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const secret = 'cambia-este-secreto';

  async function login(username: string, password: string, header = secret) {
    return request(app.getHttpServer())
      .get('/auth/login')
      .set('X-Jwt-Secret', header)
      .query({ username, password });
  }

  it('inicia sesión y rechaza usuario o contraseña con mensajes distintos', async () => {
    const ok = await login('admin@prueba.local', 'Admin123!');
    expect(ok.status).toBe(200);
    expect(ok.body.accessToken).toEqual(expect.any(String));
    const payload = JSON.parse(Buffer.from(ok.body.accessToken.split('.')[1], 'base64url').toString()) as {
      role: string;
      username: string;
      exp?: number;
    };
    expect(payload).toMatchObject({ role: 'admin', username: 'admin@prueba.local' });
    expect(payload.exp).toBeUndefined();

    const noSecret = await request(app.getHttpServer())
      .get('/auth/login')
      .query({ username: 'admin@prueba.local', password: 'Admin123!' });
    expect(noSecret.status).toBe(401);
    expect(noSecret.body.message).toBe('Falta el secreto');

    const missing = await login('nadie@prueba.local', 'Admin123!');
    expect(missing.status).toBe(401);
    expect(missing.body.message).toBe('El usuario no existe');

    const wrong = await login('admin@prueba.local', 'no-es');
    expect(wrong.status).toBe(401);
    expect(wrong.body.message).toBe('La contraseña es incorrecta');
  });

  it('responde 401 sin token y deja pasar al admin en /auth/me', async () => {
    const anon = await request(app.getHttpServer()).get('/auth/me');
    expect(anon.status).toBe(401);

    const ok = await login('manager@prueba.local', 'Manager123!');
    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('X-Jwt-Secret', secret)
      .set('Authorization', `Bearer ${ok.body.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({ username: 'manager@prueba.local', role: 'manager' });
    expect(me.body.passwordHash).toBeUndefined();

    const otherSecret = await request(app.getHttpServer())
      .get('/auth/me')
      .set('X-Jwt-Secret', 'otro-secreto')
      .set('Authorization', `Bearer ${ok.body.accessToken}`);
    expect(otherSecret.status).toBe(401);
  });

  it('responde 403 cuando el manager escribe y 200 cuando escribe el admin', async () => {
    const manager = await login('manager@prueba.local', 'Manager123!');
    const denied = await request(app.getHttpServer())
      .post('/access-check')
      .set('X-Jwt-Secret', secret)
      .send({ token: manager.body.accessToken });
    expect(denied.status).toBe(403);

    const admin = await login('admin@prueba.local', 'Admin123!');
    const allowed = await request(app.getHttpServer())
      .post('/access-check')
      .set('X-Jwt-Secret', secret)
      .send({ token: admin.body.accessToken });
    expect(allowed.status).toBe(200);
    expect(allowed.body).toEqual({ ok: true });
  });
});
