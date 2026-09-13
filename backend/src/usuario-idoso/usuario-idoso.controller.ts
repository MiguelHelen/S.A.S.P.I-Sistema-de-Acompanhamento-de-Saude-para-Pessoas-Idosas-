import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UsuarioIdosoService } from './usuario-idoso.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUsuarioIdosoDto } from './dto/create-usuario-idoso.dto';

@Controller('usuario-idoso')
@UseGuards(AuthGuard)
export class UsuarioIdosoController {
  constructor(private readonly usuarioIdosoService: UsuarioIdosoService) {}

    @Post()
  create(@Body() body: CreateUsuarioIdosoDto) {
    return this.usuarioIdosoService.create(body);
  }

  @Get('usuario/:usuarioId')
  findIdososDoUsuario(@Param('usuarioId') usuarioId: string) {
    return this.usuarioIdosoService.findIdososDoUsuario(usuarioId);
  }

  @Get('idoso/:idosoId')
  findUsuariosDoIdoso(@Param('idosoId') idosoId: string) {
    return this.usuarioIdosoService.findUsuariosDoIdoso(idosoId);
  }
}