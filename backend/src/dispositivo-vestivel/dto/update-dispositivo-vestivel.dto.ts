import { PartialType } from '@nestjs/mapped-types';
import { CreateDispositivoVestivelDto } from './create-dispositivo-vestivel.dto';

export class UpdateDispositivoVestivelDto extends PartialType(CreateDispositivoVestivelDto) {}
