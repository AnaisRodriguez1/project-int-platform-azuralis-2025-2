import { IsString, IsDateString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { CancerType } from '../../shared/enums/cancer-type.enum';

export class CreatePatientDto {
  @IsString()
  name: string;

  @IsDateString()
  dateOfBirth: string; // Formato: 'YYYY-MM-DD'

  @IsString()
  rut: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsString()
  diagnosis: string;

  @IsString()
  stage: string;

  @IsEnum(CancerType)
  cancerType: CancerType;

  @IsOptional()
  @IsEnum(CancerType)
  selectedColor?: CancerType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentMedications?: string[];

  @IsOptional()
  @IsString()
  treatmentSummary?: string;
}
