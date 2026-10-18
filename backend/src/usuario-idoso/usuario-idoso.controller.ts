import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsuarioIdosoService } from './usuario-idoso.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUsuarioIdosoDto } from './dto/create-usuario-idoso.dto';

@Controller('usuario-idoso')
@UseGuards(AuthGuard)
export class UsuarioIdosoController {
  constructor(private readonly usuarioIdosoService: UsuarioIdosoService) {}

  @Post()
  create(@Body() body: CreateUsuarioIdosoDto, @Request() req: any) {
    return this.usuarioIdosoService.create(body, req.user.id);
  }

  @Get()
  findAll(
    @Query('usuario_id') usuarioId?: string,
    @Query('idoso_id') idosoId?: string,
  ) {
    return this.usuarioIdosoService.findAll(usuarioId, idosoId);
  }

  @Get('usuario/:usuarioId')
  findIdososDoUsuario(@Param('usuarioId') usuarioId: string) {
    return this.usuarioIdosoService.findIdososDoUsuario(usuarioId);
  }

  @Get('idoso/:idosoId')
  findUsuariosDoIdoso(@Param('idosoId') idosoId: string) {
    return this.usuarioIdosoService.findUsuariosDoIdoso(idosoId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.usuarioIdosoService.remove(id, req.user.id);
  }
}