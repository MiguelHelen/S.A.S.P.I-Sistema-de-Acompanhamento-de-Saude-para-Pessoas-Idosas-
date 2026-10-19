import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  MaxLength,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LeituraDispositivoDto {
  @IsUUID()
  indicador_id: string;

  @IsOptional()
  @IsNumber()
  valor_numerico?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  valor_categorico?: string;

  @IsDateString()
  data_hora: string;
}

export class CreateRegistroSaudeLoteDto {
  @IsUUID()
  idoso_id: string;

  @IsUUID()
  dispositivo_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => LeituraDispositivoDto)
  leituras: LeituraDispositivoDto[];
}