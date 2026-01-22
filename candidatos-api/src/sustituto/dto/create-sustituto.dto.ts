import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, isBoolean } from 'class-validator';

export class CreateSustitutoDto {
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

  @IsString()
  edad: string;

  @IsDateString()
  fecha_nacimiento: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
  
  @IsString()
  usuario: string;
  
  @IsOptional()
  @IsString()
  estado?: string;
  
  @IsOptional()
  activo?: boolean;
}