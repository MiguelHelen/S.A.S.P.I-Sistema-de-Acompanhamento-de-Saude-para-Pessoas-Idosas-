import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClinicaService {
  constructor(private prisma: PrismaService) {}

  create(data: { nome: string; cnpj?: string; email?: string }) {
    return this.prisma.clinica.create({ data });
  }

  findAll() {
    return this.prisma.clinica.findMany();
  }

  findOne(id: string) {
    return this.prisma.clinica.findUnique({ where: { id } });
  }

  update(id: string, data: any) {
    return this.prisma.clinica.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.cnpj !== undefined && { cnpj: data.cnpj }),
        ...(data.telefone !== undefined && { telefone: data.telefone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.endereco !== undefined && { endereco: data.endereco }),
      },
    });
  }
}