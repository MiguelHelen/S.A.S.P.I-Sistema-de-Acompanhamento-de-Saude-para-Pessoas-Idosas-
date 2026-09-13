import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrescricaoService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    idoso_id: string;
    medicamento_id: string;
    usuario_id: string;
    dosagem?: string;
    frequencia?: string;
    data_inicio?: string;
    data_fim?: string;
  }) {
    return this.prisma.prescricao.create({
      data: {
        idoso_id: data.idoso_id,
        medicamento_id: data.medicamento_id,
        usuario_id: data.usuario_id,
        dosagem: data.dosagem,
        frequencia: data.frequencia,
        data_inicio: data.data_inicio ? new Date(data.data_inicio) : undefined,
        data_fim: data.data_fim ? new Date(data.data_fim) : undefined,
      },
    });
  }

  findByIdoso(idosoId: string) {
    return this.prisma.prescricao.findMany({
      where: { idoso_id: idosoId },
      include: { medicamento: true },
    });
  }

  // Encerra a prescricao sem apagar o historico (regra definida pelo grupo)
  encerrar(id: string) {
    return this.prisma.prescricao.update({
      where: { id },
      data: {
        status: 'ENCERRADA',
        data_fim: new Date(),
      },
    });
  }
}