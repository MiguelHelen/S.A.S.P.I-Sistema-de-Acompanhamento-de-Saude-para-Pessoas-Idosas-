import { PartialType } from '@nestjs/mapped-types';
import { CreatePrescricaoDto } from './create-prescricao.dto';

export class UpdatePrescricaoDto extends PartialType(CreatePrescricaoDto) {}
