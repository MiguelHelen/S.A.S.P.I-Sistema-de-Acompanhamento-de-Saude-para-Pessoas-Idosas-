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

  // Lista todos os idosos que um usuário específico pode acompanhar
  findIdososDoUsuario(usuarioId: string) {
    return this.prisma.usuario_idoso.findMany({
      where: { usuario_id: usuarioId },
      include: { idoso: true },
    });
  }

  // Lista todos os usuários vinculados a um idoso específico
  findUsuariosDoIdoso(idosoId: string) {
    return this.prisma.usuario_idoso.findMany({
      where: { idoso_id: idosoId },
      include: { usuario: true },
    });
  }
}