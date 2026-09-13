import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PrescricaoService } from './prescricao.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreatePrescricaoDto } from './dto/create-prescricao.dto';

@Controller('prescricao')
@UseGuards(AuthGuard)
export class PrescricaoController {
  constructor(private readonly prescricaoService: PrescricaoService) {}

    @Post()
  create(@Body() body: CreatePrescricaoDto) {
    return this.prescricaoService.create(body);
  }

  @Get('idoso/:idosoId')
  findByIdoso(@Param('idosoId') idosoId: string) {
    return this.prescricaoService.findByIdoso(idosoId);
  }

  @Patch(':id/encerrar')
  encerrar(@Param('id') id: string) {
    return this.prescricaoService.encerrar(id);
  }
}