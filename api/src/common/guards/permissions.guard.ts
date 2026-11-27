import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_PERMISSIONS } from '../constants/permissions.constant.js';
import { Public } from '../decorators/public.decorator.js';
import { RequirePermissions } from '../decorators/require-permissions.decorator.js';
import type { RequestWithUser } from './jwt-auth.guard.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride(Public, targets)) return true;

    const required = this.reflector.getAllAndOverride(RequirePermissions, targets);
    if (!required) return true;

    const user = context.switchToHttp().getRequest<RequestWithUser>().user;
    if (!user) throw new UnauthorizedException('Falta el token');

    const allowed = ROLE_PERMISSIONS[user.role];
    if (!allowed.includes(required as (typeof allowed)[number])) {
      throw new ForbiddenException('No tiene permiso para esta acción');
    }
    return true;
  }
}
