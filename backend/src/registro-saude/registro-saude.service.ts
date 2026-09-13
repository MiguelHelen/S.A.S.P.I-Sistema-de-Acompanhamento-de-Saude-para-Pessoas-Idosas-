import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TempoRealGateway } from '../tempo-real/tempo-real.gateway';

@Injectable()
export class RegistroSaudeService {
  constructor(
    private prisma: PrismaService,
    private tempoReal: TempoRealGateway,
  ) {}

  async create(data: {
    idoso_id: string;
    indicador_id: string;
    valor_numerico?: number;
    valor_categorico?: string;
    origem: 'MANUAL' | 'AUTOMATICO';
    usuario_id?: string;
    dispositivo_id?: string;
  }) {
    if (data.origem === 'MANUAL' && !data.usuario_id) {
      throw new BadRequestException(
        'Registro manual precisa informar usuario_id',
      );
    }
    if (data.origem === 'AUTOMATICO' && !data.dispositivo_id) {
      throw new BadRequestException(
        'Registro automatico precisa informar dispositivo_id',
      );
    }
    if (data.valor_numerico == null && !data.valor_categorico) {
      throw new BadRequestException(
        'Informe valor_numerico ou valor_categorico',
      );
    }

    const registro = await this.prisma.registro_saude.create({
      data: {
        idoso_id: data.idoso_id,
        indicador_id: data.indicador_id,
        valor_numerico: data.valor_numerico,
        valor_categorico: data.valor_categorico,
        origem: data.origem as any,
        usuario_id: data.origem === 'MANUAL' ? data.usuario_id : null,
        dispositivo_id:
          data.origem === 'AUTOMATICO' ? data.dispositivo_id : null,
      },
      include: { indicador_saude: true },
    });

    this.tempoReal.emitirNovoRegistro(data.idoso_id, registro);

    const nomeIndicador = registro.indicador_saude.nome.toLowerCase();
    if (
      nomeIndicador.includes('cardiaca') &&
      data.valor_numerico &&
      (data.valor_numerico > 120 || data.valor_numerico < 40)
    ) {
      this.tempoReal.emitirAlerta(
        data.idoso_id,
        `Frequencia cardiaca fora do normal: ${data.valor_numerico} bpm`,
      );
    }

    return registro;
  }

  findByIdoso(idosoId: string) {
    return this.prisma.registro_saude.findMany({
      where: { idoso_id: idosoId },
      orderBy: { data_hora: 'desc' },
      include: { indicador_saude: true },
    });
  }
}