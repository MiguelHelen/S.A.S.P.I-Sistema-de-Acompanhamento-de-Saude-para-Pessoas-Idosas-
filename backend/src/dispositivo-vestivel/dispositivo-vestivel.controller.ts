import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DispositivoVestivelService } from './dispositivo-vestivel.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateDispositivoVestivelDto } from './dto/create-dispositivo-vestivel.dto';

@Controller('dispositivo-vestivel')
@UseGuards(AuthGuard)
export class DispositivoVestivelController {
  constructor(
    private readonly dispositivoVestivelService: DispositivoVestivelService,
  ) {}

    @Post()
  create(@Body() body: CreateDispositivoVestivelDto) {
    return this.dispositivoVestivelService.create(body);
  }

  @Get()
  findAll() {
    return this.dispositivoVestivelService.findAll();
  }

  @Get('idoso/:idosoId')
  findByIdoso(@Param('idosoId') idosoId: string) {
    return this.dispositivoVestivelService.findByIdoso(idosoId);
  }
}