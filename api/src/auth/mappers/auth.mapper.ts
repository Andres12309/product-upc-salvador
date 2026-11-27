import type { AuthUser } from '../../users/user.js';
import { LoginResponseDto } from '../dto/login-response.dto.js';
import { SessionUserDto } from '../dto/session-user.dto.js';

export class AuthMapper {
  static toLoginResponse(accessToken: string): LoginResponseDto {
    const dto = new LoginResponseDto();
    dto.accessToken = accessToken;
    return dto;
  }

  static toSessionUser(user: AuthUser): SessionUserDto {
    const dto = new SessionUserDto();
    dto.id = user.id;
    dto.username = user.username;
    dto.role = user.role;
    return dto;
  }
}
