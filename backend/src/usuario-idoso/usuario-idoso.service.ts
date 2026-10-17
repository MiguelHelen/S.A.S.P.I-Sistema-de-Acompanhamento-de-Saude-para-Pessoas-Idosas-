import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuarioIdosoService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    usuario_id: string;
    idoso_id: string;
    tipo_vinculo: string;
  }) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: data.usuario_id },
    });

    if (!usuario) {
      throw new BadRequestException('Profissional ou familiar nao encontrado.');
    }

    if (usuario.perfil === 'ADMINISTRADOR') {
      throw new BadRequestException(
        'Contas com perfil Administrador nao podem receber vinculos clinicos.',
      );
    }

    const vinculoExistente = await this.prisma.usuario_idoso.findFirst({
      where: {
        usuario_id: data.usuario_id,
        idoso_id: data.idoso_id,
      },
    });

    if (vinculoExistente) {
      throw new ConflictException(
        'Este usuario ja esta vinculado a este paciente.',
      );
    }

    return this.prisma.usuario_idoso.create({
      data: {
        usuario_id: data.usuario_id,
        idoso_id: data.idoso_id,
        tipo_vinculo: data.tipo_vinculo as any,
      },
      include: {
        usuario: true,
        idoso: true,
      },
    });
  }

  findAll(usuarioId?: string, idosoId?: string) {
    const where: any = {};
    if (usuarioId) where.usuario_id = usuarioId;
    if (idosoId) where.idoso_id = idosoId;

    return this.prisma.usuario_idoso.findMany({
      where,
      include: {
        usuario: true,
        idoso: true,
      },
    });
  }

  findIdososDoUsuario(usuarioId: string) {
    return this.prisma.usuario_idoso.findMany({
      where: { usuario_id: usuarioId },
      include: { idoso: true },
    });
  }

  findUsuariosDoIdoso(idosoId: string) {
    return this.prisma.usuario_idoso.findMany({
      where: { idoso_id: idosoId },
      include: { usuario: true },
    });
  }

  remove(id: string) {
    return this.prisma.usuario_idoso.delete({
      where: { id },
    });
  }
}