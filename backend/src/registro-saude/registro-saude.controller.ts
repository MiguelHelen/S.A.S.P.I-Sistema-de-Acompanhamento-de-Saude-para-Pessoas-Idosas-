import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RegistroSaudeService } from './registro-saude.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateRegistroSaudeDto } from './dto/create-registro-saude.dto';
import { CreateRegistroSaudeLoteDto } from './dto/create-registro-saude-lote.dto';

@Controller('registro-saude')
@UseGuards(AuthGuard)
export class RegistroSaudeController {
  constructor(private readonly registroSaudeService: RegistroSaudeService) {}

  @Post()
  create(@Body() body: CreateRegistroSaudeDto, @Request() req: any) {
    return this.registroSaudeService.create(body, req.user.id);
  }

  @Post('lote')
  createLote(@Body() body: CreateRegistroSaudeLoteDto, @Request() req: any) {
    return this.registroSaudeService.createLote(body, req.user.id);
  }

  @Get()
  findAll(@Query('idoso_id') idosoId: string, @Request() req: any) {
    if (!idosoId) return [];
    return this.registroSaudeService.findByIdosoSeguro(idosoId, req.user.id);
  }

  @Get('idoso/:idosoId')
  findByIdoso(@Param('idosoId') idosoId: string, @Request() req: any) {
    return this.registroSaudeService.findByIdosoSeguro(idosoId, req.user.id);
  }
}