import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuarioIdosoService {
  constructor(private prisma: PrismaService) {}

  create(data: { usuario_id: string; idoso_id: string; tipo_vinculo: string }) {
    return this.prisma.usuario_idoso.create({
      data: {
        usuario_id: data.usuario_id,
        idoso_id: data.idoso_id,
        tipo_vinculo: data.tipo_vinculo as any,
      },
    });
  }

  // Traz a lista de vínculos e inclui os objetos para o frontend mostrar os Nomes
  findAll(usuarioId?: string, idosoId?: string) {
    const where: any = {};
    if (usuarioId) where.usuario_id = usuarioId;
    if (idosoId) where.idoso_id = idosoId;

    return this.prisma.usuario_idoso.findMany({
      where,
      include: {
        usuario: true, // Garante que a extração do nome do usuário funcione no React
        idoso: true,   // Garante que a extração do nome do idoso funcione no React
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

  // Remove o vínculo pelo ID único de registro
  remove(id: string) {
    return this.prisma.usuario_idoso.delete({
      where: { id },
    });
  }
}