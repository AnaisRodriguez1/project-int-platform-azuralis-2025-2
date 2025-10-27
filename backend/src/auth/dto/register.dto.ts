import { IsEmail, IsEnum, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { UserRole } from '../../shared/enums/user-role.enum';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Debe ingresar un email válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @Matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/, { message: 'El RUT debe tener el formato 12.345.678-9' })
  rut: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser uno de: patient, doctor, nurse o guardian' })
  role?: UserRole;
}
