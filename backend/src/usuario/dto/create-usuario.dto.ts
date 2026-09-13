import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, IsIn, IsUUID } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsIn(['ADMINISTRADOR', 'MEDICO', 'ENFERMEIRO', 'CUIDADOR', 'FAMILIAR'])
  perfil: string;

  @IsUUID()
  clinica_id: string;
}