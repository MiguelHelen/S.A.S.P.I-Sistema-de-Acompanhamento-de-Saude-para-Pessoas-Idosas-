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
import { IdosoService } from './idoso.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateIdosoDto } from './dto/create-idoso.dto';
import { UpdateIdosoDto } from './dto/update-idoso.dto';

@Controller('idoso')
@UseGuards(AuthGuard)
export class IdosoController {
  constructor(private readonly idosoService: IdosoService) {}

  @Post()
  create(@Body() body: CreateIdosoDto, @Request() req: any) {
    return this.idosoService.create(body, req.user.id);
  }

  @Get()
  findAll(@Query('clinica_id') clinicaId: string, @Request() req: any) {
    if (!clinicaId) return [];
    return this.idosoService.findAllSeguro(clinicaId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.idosoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateIdosoDto,
    @Request() req: any,
  ) {
    return this.idosoService.update(id, body, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.idosoService.remove(id, req.user.id);
  }
}