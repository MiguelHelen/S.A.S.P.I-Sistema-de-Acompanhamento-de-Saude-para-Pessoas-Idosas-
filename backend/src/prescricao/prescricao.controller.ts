import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrescricaoService } from './prescricao.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreatePrescricaoDto } from './dto/create-prescricao.dto';

@Controller('prescricao')
@UseGuards(AuthGuard)
export class PrescricaoController {
  constructor(private readonly prescricaoService: PrescricaoService) {}

  @Post()
  create(@Body() body: CreatePrescricaoDto, @Request() req: any) {
    return this.prescricaoService.create(body, req.user.id);
  }

  @Get()
  findAll(@Query('idoso_id') idosoId: string, @Request() req: any) {
    if (!idosoId) return [];
    return this.prescricaoService.findByIdosoSeguro(idosoId, req.user.id);
  }

  @Get('idoso/:idosoId')
  findByIdoso(@Param('idosoId') idosoId: string, @Request() req: any) {
    return this.prescricaoService.findByIdosoSeguro(idosoId, req.user.id);
  }

  @Patch(':id/encerrar')
  encerrar(@Param('id') id: string, @Request() req: any) {
    return this.prescricaoService.encerrar(id, req.user.id);
  }
}