import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicamentoService {
  constructor(private prisma: PrismaService) {}

  create(data: { nome: string; descricao?: string }) {
    return this.prisma.medicamento.create({ data });
  }

  findAll() {
    return this.prisma.medicamento.findMany();
  }

  findOne(id: string) {
    return this.prisma.medicamento.findUnique({ where: { id } });
  }
}