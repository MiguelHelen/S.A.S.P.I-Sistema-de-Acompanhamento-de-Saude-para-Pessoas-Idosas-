import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { IdosoService } from './idoso.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateIdosoDto } from './dto/create-idoso.dto';

@Controller('idoso')
@UseGuards(AuthGuard)
export class IdosoController {
  constructor(private readonly idosoService: IdosoService) {}

   @Post()
  create(@Body() body: CreateIdosoDto) {
    return this.idosoService.create(body);
  }

  @Get()
  findAll() {
    return this.idosoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.idosoService.findOne(id);
  }
}