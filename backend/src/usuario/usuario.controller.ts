import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Controller('usuario')
@UseGuards(AuthGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

    @Post()
  create(@Body() body: CreateUsuarioDto) {
    return this.usuarioService.create(body);
  }

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }
}