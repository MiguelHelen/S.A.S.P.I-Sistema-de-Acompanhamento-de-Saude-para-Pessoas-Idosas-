import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistroSaudeDto } from './create-registro-saude.dto';

export class UpdateRegistroSaudeDto extends PartialType(CreateRegistroSaudeDto) {}
