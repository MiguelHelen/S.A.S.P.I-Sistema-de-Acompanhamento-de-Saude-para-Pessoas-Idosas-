import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateConsultaDto {
  @IsUUID()
  idoso_id: string;

  @IsOptional()
  @IsUUID()
  usuario_id?: string;

  @IsString()
  @IsNotEmpty()
  especialidade: string;

  @IsString()
  @IsNotEmpty()
  medico: string;

  @IsDateString()
  data: string;

  @IsString()
  @IsNotEmpty()
  horario: string;

  @IsString()
  @IsNotEmpty()
  localizacao: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsIn(['Agendada', 'Confirmada', 'Realizada', 'Cancelada'])
  status?: string;
}