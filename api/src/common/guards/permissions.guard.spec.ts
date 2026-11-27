import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/core';
import { describe, expect, it } from 'vitest';
import { Permissions } from '../constants/permissions.constant.js';
import { Public } from '../decorators/public.decorator.js';
import { RequirePermissions } from '../decorators/require-permissions.decorator.js';
import { PermissionsGuard } from './permissions.guard.js';

function guardFor(required: string) {
  const reflector = {
    getAllAndOverride: (key: unknown) => {
      if (key === Public) return undefined;
      if (key === RequirePermissions) return required;
      return undefined;
    },
  };
  return new PermissionsGuard(reflector as never);
}

function context(role: 'admin' | 'manager'): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user: { id: '1', username: 'a', role } }) }),
  } as ExecutionContext;
}

describe('permisos por rol', () => {
  const write = guardFor(Permissions.PRODUCTS.WRITE);
  const read = guardFor(Permissions.PRODUCTS.READ);

  it('deja leer al manager y le niega la escritura', () => {
    expect(read.canActivate(context('manager'))).toBe(true);
    expect(() => write.canActivate(context('manager'))).toThrow(ForbiddenException);
    expect(() => write.canActivate(context('manager'))).toThrow('No tiene permiso para esta acción');
  });

  it('deja escribir al admin', () => {
    expect(write.canActivate(context('admin'))).toBe(true);
  });
});
