import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConsultaService } from './consulta.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateConsultaDto } from './dto/create-consulta.dto';

@Controller('consulta')
@UseGuards(AuthGuard)
export class ConsultaController {
  constructor(private readonly consultaService: ConsultaService) {}

  @Post()
  create(@Body() body: CreateConsultaDto, @Request() req: any) {
    return this.consultaService.create(body, req.user.id);
  }

  @Get()
  findAll(@Query('idoso_id') idosoId: string, @Request() req: any) {
    if (!idosoId) return [];
    return this.consultaService.findAllSeguro(idosoId, req.user.id);
  }

  @Get('idoso/:idosoId')
  findByIdoso(@Param('idosoId') idosoId: string, @Request() req: any) {
    return this.consultaService.findAllSeguro(idosoId, req.user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: any,
  ) {
    return this.consultaService.updateStatus(id, body.status, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.consultaService.remove(id, req.user.id);
  }
}