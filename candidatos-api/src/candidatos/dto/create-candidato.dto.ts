// src/candidatos/dto/create-candidato.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateCandidatoDto {
  @IsString()
  nombre_del_partido: string;

  @IsString()
  departamento: string;

  @IsString()
  @IsOptional()
  provincia?: string;

  @IsString()
  @IsOptional()
  municipio?: string;

  @IsString()
  candidato: string;

  @IsNumber()
  posicion: number;

  @IsString()
  titularidad: string;

  @IsString()
  nombre_completo: string;

  @IsString()
  nro_documento: string;

  @IsString()
  genero: string;

  @IsNumber()
  edad: number;

  @IsString()
  fecha_nacimiento: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  usuario: string;

  @IsString()
  fecha_registro: string;

  @IsString()
  estado: string;

  @IsBoolean()
  activo: boolean;
}