import { Transform, Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialsDto {
  @Transform(({value}) => value.trim())
  @IsNotEmpty({ message: '' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  usuario: string;
  
  @Transform(({value}) => value.trim())
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'La contraseña es demasiado débil'})
  contrasena: string;

  @IsNotEmpty({ message: '' })
  @Type(() => Number)
  @IsInt({ message: '' })
  @IsOptional()
  idsistema: number
}