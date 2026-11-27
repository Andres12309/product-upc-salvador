import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser } from '../../users/user.js';
import { UsersService } from '../../users/users.service.js';
import { Public } from '../decorators/public.decorator.js';

export type RequestWithUser = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: { token?: unknown };
  user?: AuthUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride(Public, [context.getHandler(), context.getClass()])) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.readToken(request);
    if (!token) throw new UnauthorizedException('Falta el token');
    const secret = this.readSecret(request);
    if (!secret) throw new UnauthorizedException('Falta el secreto');

    let sub: string;
    try {
      ({ sub } = await this.jwt.verifyAsync<{ sub: string }>(token, { secret }));
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }

    const user = sub ? await this.users.findById(sub) : null;
    if (!user) throw new UnauthorizedException('Token inválido o vencido');
    request.user = user;
    return true;
  }

  private readToken(request: RequestWithUser): string | null {
    if (typeof request.body?.token === 'string' && request.body.token.length > 0) {
      return request.body.token;
    }

    const raw = request.headers?.authorization;
    const header = Array.isArray(raw) ? raw[0] : raw;
    if (!header?.startsWith('Bearer ')) return null;
    const token = header.slice('Bearer '.length).trim();
    return token || null;
  }

  private readSecret(request: RequestWithUser): string | null {
    const raw = request.headers?.['x-jwt-secret'];
    const header = Array.isArray(raw) ? raw[0] : raw;
    const secret = header?.trim();
    return secret || null;
  }
}
