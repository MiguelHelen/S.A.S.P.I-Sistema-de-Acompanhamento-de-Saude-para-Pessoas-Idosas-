import { IsString, IsOptional, IsUUID, IsIn, IsNumber } from 'class-validator';

export class CreateRegistroSaudeDto {
  @IsUUID()
  idoso_id: string;

  @IsUUID()
  indicador_id: string;

  @IsOptional()
  @IsNumber()
  valor_numerico?: number;

  @IsOptional()
  @IsString()
  valor_categorico?: string;

  @IsIn(['MANUAL', 'AUTOMATICO'])
  origem: 'MANUAL' | 'AUTOMATICO';

  @IsOptional()
  @IsUUID()
  usuario_id?: string;

  @IsOptional()
  @IsUUID()
  dispositivo_id?: string;
}