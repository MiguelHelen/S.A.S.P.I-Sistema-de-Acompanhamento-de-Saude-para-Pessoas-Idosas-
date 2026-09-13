import { IsUUID, IsIn } from 'class-validator';

export class CreateUsuarioIdosoDto {
  @IsUUID()
  usuario_id: string;

  @IsUUID()
  idoso_id: string;

  @IsIn(['MEDICO_RESPONSAVEL', 'ENFERMEIRO', 'CUIDADOR', 'FAMILIAR'])
  tipo_vinculo: string;
}