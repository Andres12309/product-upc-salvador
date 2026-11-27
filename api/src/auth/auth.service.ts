import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { AuthMapper } from './mappers/auth.mapper.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string, secret?: string): Promise<LoginResponseDto> {
    const found = await this.users.findCredentials(username);
    const valid = await this.passwordHasher.verify(password, found?.passwordHash);
    if (!found) throw new UnauthorizedException('El usuario no existe');
    if (!valid) throw new UnauthorizedException('La contraseña es incorrecta');
    if (!secret) throw new UnauthorizedException('Falta el secreto');

    const accessToken = await this.jwt.signAsync(
      {
        sub: found.user.id,
        username: found.user.username,
        role: found.user.role,
      },
      { secret, algorithm: 'HS256' },
    );
    return AuthMapper.toLoginResponse(accessToken);
  }
}
