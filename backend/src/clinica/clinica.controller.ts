import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ClinicaService } from './clinica.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateClinicaDto } from './dto/create-clinica.dto';

@Controller('clinica')
@UseGuards(AuthGuard)
export class ClinicaController {
  constructor(private readonly clinicaService: ClinicaService) {}

    @Post()
  create(@Body() body: CreateClinicaDto) {
    return this.clinicaService.create(body);
  }

  @Get()
  findAll() {
    return this.clinicaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicaService.findOne(id);
  }
}