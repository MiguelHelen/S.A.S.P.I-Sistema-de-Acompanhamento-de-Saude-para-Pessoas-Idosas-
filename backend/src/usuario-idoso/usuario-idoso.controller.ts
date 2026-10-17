import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
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

  // O frontend precisa dessa rota para a tabela de listagem
  @Get()
  findAll(@Query('usuario_id') usuarioId?: string, @Query('idoso_id') idosoId?: string) {
    return this.usuarioIdosoService.findAll(usuarioId, idosoId);
  }

  // Mantidas as rotas antigas por segurança caso algo as utilize
  @Get('usuario/:usuarioId')
  findIdososDoUsuario(@Param('usuarioId') usuarioId: string) {
    return this.usuarioIdosoService.findIdososDoUsuario(usuarioId);
  }

  @Get('idoso/:idosoId')
  findUsuariosDoIdoso(@Param('idosoId') idosoId: string) {
    return this.usuarioIdosoService.findUsuariosDoIdoso(idosoId);
  }

  // O frontend precisa dessa rota para o botão "Desvincular"
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioIdosoService.remove(id);
  }
}