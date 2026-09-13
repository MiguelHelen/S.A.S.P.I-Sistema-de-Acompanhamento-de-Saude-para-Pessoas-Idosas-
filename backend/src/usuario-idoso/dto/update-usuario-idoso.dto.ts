import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioIdosoDto } from './create-usuario-idoso.dto';

export class UpdateUsuarioIdosoDto extends PartialType(CreateUsuarioIdosoDto) {}
