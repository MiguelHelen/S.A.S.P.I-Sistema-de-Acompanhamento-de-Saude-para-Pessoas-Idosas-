import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { IndicadorSaudeService } from './indicador-saude.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateIndicadorSaudeDto } from './dto/create-indicador-saude.dto';

@Controller('indicador-saude')
@UseGuards(AuthGuard)
export class IndicadorSaudeController {
  constructor(private readonly indicadorSaudeService: IndicadorSaudeService) {}

    @Post()
  create(@Body() body: CreateIndicadorSaudeDto) {
    return this.indicadorSaudeService.create(body);
  }

  @Get()
  findAll() {
    return this.indicadorSaudeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.indicadorSaudeService.findOne(id);
  }
}