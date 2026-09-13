import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMedicamentoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}