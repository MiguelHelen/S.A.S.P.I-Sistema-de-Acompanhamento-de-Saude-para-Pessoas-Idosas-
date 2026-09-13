import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateIdosoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsDateString()
  data_nascimento: string;

  @IsOptional()
  @IsString()
  sexo?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsUUID()
  clinica_id: string;
}