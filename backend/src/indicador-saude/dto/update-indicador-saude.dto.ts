import { PartialType } from '@nestjs/mapped-types';
import { CreateIndicadorSaudeDto } from './create-indicador-saude.dto';

export class UpdateIndicadorSaudeDto extends PartialType(CreateIndicadorSaudeDto) {}
