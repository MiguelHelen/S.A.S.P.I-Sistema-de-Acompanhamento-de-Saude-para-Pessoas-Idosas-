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
import { UsuarioService } from './usuario.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuario')
@UseGuards(AuthGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  create(@Body() body: CreateUsuarioDto, @Request() req: any) {
    return this.usuarioService.create(body, req.user.id);
  }

  @Get()
  findAll(
    @Query('clinica_id') clinicaId?: string,
    @Query('email') email?: string,
  ) {
    return this.usuarioService.findAll(clinicaId, email);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateUsuarioDto,
    @Request() req: any,
  ) {
    return this.usuarioService.update(id, body, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.usuarioService.remove(id, req.user.id);
  }
}