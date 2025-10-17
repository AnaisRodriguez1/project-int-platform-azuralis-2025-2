import { IsString, IsInt, IsEnum, IsArray, IsOptional, Min, Max } from 'class-validator';
import { CancerType } from '../../shared/enums/cancer-type.enum';

export class CreatePatientDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

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
