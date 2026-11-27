import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../../users/user.js';
import type { RequestWithUser } from '../guards/jwt-auth.guard.js';

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): AuthUser => {
  return context.switchToHttp().getRequest<RequestWithUser>().user as AuthUser;
});
