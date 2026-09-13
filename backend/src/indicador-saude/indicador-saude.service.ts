import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IndicadorSaudeService {
  constructor(private prisma: PrismaService) {}

  create(data: { nome: string; unidade_padrao?: string; descricao?: string }) {
    return this.prisma.indicador_saude.create({ data });
  }

  findAll() {
    return this.prisma.indicador_saude.findMany();
  }

  findOne(id: string) {
    return this.prisma.indicador_saude.findUnique({ where: { id } });
  }
}