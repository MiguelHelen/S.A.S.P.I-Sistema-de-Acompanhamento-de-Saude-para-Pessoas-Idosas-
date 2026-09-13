import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateIndicadorSaudeDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsString()
  unidade_padrao?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}