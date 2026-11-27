import { UnauthorizedException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import type { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import type { UsersService } from '../users/users.service.js';

describe('AuthService', () => {
  const hasher = new PasswordHasher({ logN: 10 });
  const users = {
    findCredentials: vi.fn(),
  };
  const jwt = {
    signAsync: vi.fn().mockResolvedValue('token-firmado'),
  };
  const service = new AuthService(
    users as unknown as UsersService,
    hasher,
    jwt as unknown as JwtService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    jwt.signAsync.mockResolvedValue('token-firmado');
  });

  it('distingue un usuario que no existe', async () => {
    users.findCredentials.mockResolvedValue(null);
    await expect(service.login('nadie@prueba.local', 'Admin123!')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.login('nadie@prueba.local', 'Admin123!')).rejects.toThrow('El usuario no existe');
  });

  it('distingue una contraseña incorrecta', async () => {
    users.findCredentials.mockResolvedValue({
      user: { id: '1', username: 'admin@prueba.local', role: 'admin' },
      passwordHash: await hasher.hash('Admin123!'),
    });
    await expect(service.login('admin@prueba.local', 'otra')).rejects.toThrow('La contraseña es incorrecta');
  });

  it('rechaza un login válido si no llega el secreto', async () => {
    users.findCredentials.mockResolvedValue({
      user: { id: '1', username: 'admin@prueba.local', role: 'admin' },
      passwordHash: await hasher.hash('Admin123!'),
    });
    await expect(service.login('admin@prueba.local', 'Admin123!')).rejects.toThrow('Falta el secreto');
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('firma con el secreto que manda el front y no pone vencimiento', async () => {
    users.findCredentials.mockResolvedValue({
      user: { id: '1', username: 'admin@prueba.local', role: 'admin' },
      passwordHash: await hasher.hash('Admin123!'),
    });
    await expect(service.login('admin@prueba.local', 'Admin123!', 'cambia-este-secreto')).resolves.toEqual({
      accessToken: 'token-firmado',
    });
    expect(jwt.signAsync).toHaveBeenCalledWith(
      { sub: '1', username: 'admin@prueba.local', role: 'admin' },
      { secret: 'cambia-este-secreto', algorithm: 'HS256' },
    );
  });
});
