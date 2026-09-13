import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateClinicaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}