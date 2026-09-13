import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateDispositivoVestivelDto {
  @IsOptional()
  @IsString()
  fabricante?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  identificador_dispositivo?: string;

  @IsUUID()
  idoso_id: string;
}