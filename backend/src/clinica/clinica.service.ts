import { Injectable, ForbiddenException } from '@nestjs/common';
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

  async update(id: string, data: any, authId?: string) {
    if (authId) {
      const solicitante = await this.prisma.usuario.findUnique({
        where: { auth_id: authId },
      });
      if (solicitante && solicitante.perfil !== 'ADMINISTRADOR') {
        throw new ForbiddenException(
          'Apenas Administradores possuem permissão para alterar os dados da clínica.',
        );
      }
    }

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