import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MedicamentoService } from './medicamento.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto';

@Controller('medicamento')
@UseGuards(AuthGuard)
export class MedicamentoController {
  constructor(private readonly medicamentoService: MedicamentoService) {}

    @Post()
  create(@Body() body: CreateMedicamentoDto) {
    return this.medicamentoService.create(body);
  }

  @Get()
  findAll() {
    return this.medicamentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicamentoService.findOne(id);
  }
}