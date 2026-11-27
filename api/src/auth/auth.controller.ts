import { Controller, Get, Headers, Query } from '@nestjs/common';
import type { AuthUser } from '../users/user.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { LoginQueryDto } from './dto/login-query.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { SessionUserDto } from './dto/session-user.dto.js';
import { AuthMapper } from './mappers/auth.mapper.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('login')
  login(
    @Query() query: LoginQueryDto,
    @Headers('x-jwt-secret') secret?: string | string[],
  ): Promise<LoginResponseDto> {
    const value = Array.isArray(secret) ? secret[0] : secret;
    return this.auth.login(query.username, query.password, value?.trim() || undefined);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): SessionUserDto {
    return AuthMapper.toSessionUser(user);
  }
}
