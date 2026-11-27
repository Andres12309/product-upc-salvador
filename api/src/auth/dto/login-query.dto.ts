import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginQueryDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Indica el usuario y la contraseña.' })
  @IsNotEmpty({ message: 'Indica el usuario y la contraseña.' })
  username: string;

  @IsString({ message: 'Indica el usuario y la contraseña.' })
  @IsNotEmpty({ message: 'Indica el usuario y la contraseña.' })
  password: string;
}
