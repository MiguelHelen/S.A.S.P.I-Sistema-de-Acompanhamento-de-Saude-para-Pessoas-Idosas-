import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdosoService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    nome: string;
    cpf?: string;
    data_nascimento: string;
    sexo?: string;
    telefone?: string;
    endereco?: string;
    clinica_id: string;
  }) {
    return this.prisma.idoso.create({
      data: {
        ...data,
        data_nascimento: new Date(data.data_nascimento),
      },
    });
  }

  findAll() {
    return this.prisma.idoso.findMany();
  }

  findOne(id: string) {
    return this.prisma.idoso.findUnique({ where: { id } });
  }
}