import { IsString, IsOptional, IsUUID, IsDateString, IsIn } from 'class-validator';

export class CreatePrescricaoDto {
  @IsUUID()
  idoso_id: string;

  @IsUUID()
  medicamento_id: string;

  @IsUUID()
  usuario_id: string;

  @IsOptional()
  @IsString()
  dosagem?: string;

  @IsOptional()
  @IsString()
  frequencia?: string;

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @IsOptional()
  @IsIn(['ATIVA', 'ENCERRADA'])
  status?: 'ATIVA' | 'ENCERRADA';
}