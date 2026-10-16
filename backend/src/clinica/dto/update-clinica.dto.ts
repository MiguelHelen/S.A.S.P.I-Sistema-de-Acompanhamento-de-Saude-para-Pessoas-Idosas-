import { PartialType } from '@nestjs/mapped-types';
import { CreateClinicaDto } from './create-clinica.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateClinicaDto extends PartialType(CreateClinicaDto) {
  @IsOptional()
  @IsString()
  endereco?: string;
}