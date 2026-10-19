import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
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
  create(@Body() body: CreateDispositivoVestivelDto, @Request() req: any) {
    return this.dispositivoVestivelService.create(body, req.user.id);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.dispositivoVestivelService.findAll(req.user.id);
  }

  @Get('idoso/:idosoId')
  findByIdoso(@Param('idosoId') idosoId: string, @Request() req: any) {
    return this.dispositivoVestivelService.findByIdoso(idosoId, req.user.id);
  }
}