import { IsString, IsNotEmpty } from 'class-validator';

export class EmergencyAccessDto {
  @IsString()
  @IsNotEmpty()
  rut: string;
}
