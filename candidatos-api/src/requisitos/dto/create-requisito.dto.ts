// src/requisitos/dto/create-requisito.dto.ts
import {
  IsInt,
  IsBoolean,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateRequisitoDto {
  @IsInt()
  idsustituto: number;

  @IsBoolean()
  @IsOptional()
  certificadonac?: boolean;

  @IsString()
  @IsOptional()
  certificadonacobs?: string;

  @IsBoolean()
  @IsOptional()
  cedulacopia?: boolean;

  @IsString()
  @IsOptional()
  cedulacopiaobs?: string;

  @IsBoolean()
  @IsOptional()
  libretamilitarcopia?: boolean;

  @IsString()
  @IsOptional()
  libretamilitarcopiaobs?: string;

  @IsBoolean()
  @IsOptional()
  solvenciafiscal?: boolean;

  @IsString()
  @IsOptional()
  solvenciafiscalobs?: string;

  @IsBoolean()
  @IsOptional()
  rejap?: boolean;

  @IsString()
  @IsOptional()
  rejapobs?: string;

  @IsBoolean()
  @IsOptional()
  declaracionnotarial?: boolean;

  @IsString()
  @IsOptional()
  declaracionnotarialobs?: string;

  @IsBoolean()
  @IsOptional()
  padron?: boolean;

  @IsString()
  @IsOptional()
  padronobs?: string;

  @IsBoolean()
  @IsOptional()
  certidiomas?: boolean;

  @IsString()
  @IsOptional()
  certidiomasobs?: string;

  @IsBoolean()
  @IsOptional()
  cenvi?: boolean;

  @IsString()
  @IsOptional()
  cenviobs?: string;

  @IsBoolean()
  @IsOptional()
  declaraciondomicilio?: boolean;

  @IsString() 
  @IsOptional()
  declaraciondomicilioobs?: string;

  @IsString()
  @IsOptional()
  whastapp?: string;
}