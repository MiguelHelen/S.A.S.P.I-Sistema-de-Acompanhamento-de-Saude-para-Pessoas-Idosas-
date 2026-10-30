import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRegistroSaudeLoteDto } from './dto/create-registro-saude-lote.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TempoRealGateway } from '../tempo-real/tempo-real.gateway';

@Injectable()
export class RegistroSaudeService {
  constructor(
    private prisma: PrismaService,
    private tempoReal: TempoRealGateway,
  ) {}

  private async validarAcesso(
    idosoId: string,
    authId: string,
    operacao: 'leitura' | 'escrita',
  ) {
    const usuarioLogado = await this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });

    if (!usuarioLogado) throw new ForbiddenException('Usuário inválido.');

    if (usuarioLogado.perfil === 'ADMINISTRADOR' && operacao === 'escrita') {
      throw new ForbiddenException(
        'Administradores não podem inserir aferições.',
      );
    }

    if (usuarioLogado.perfil !== 'ADMINISTRADOR') {
      const vinculo = await this.prisma.usuario_idoso.findFirst({
        where: { usuario_id: usuarioLogado.id, idoso_id: idosoId },
      });
      if (!vinculo) {
        throw new ForbiddenException(
          'Acesso negado: você não tem vínculo com este paciente.',
        );
      }
    }

    if (operacao === 'escrita' && usuarioLogado.perfil === 'FAMILIAR') {
      throw new ForbiddenException(
        'Familiares possuem permissão apenas de leitura clínica.',
      );
    }

    return usuarioLogado;
  }

  private verificarAlertaCritico(
    nomeIndicador: string,
    valorNumerico?: number | null,
    valorCategorico?: string | null,
  ): string | null {
    const nome = (nomeIndicador || '').toLowerCase();

    if (nome.includes('card') && typeof valorNumerico === 'number') {
      if (valorNumerico < 60) {
        return `Alerta de Bradicardia: Frequência cardíaca abaixo do padrão seguro (${valorNumerico} bpm).`;
      }
      if (valorNumerico > 100) {
        return `Alerta de Taquicardia: Frequência cardíaca acima do padrão seguro (${valorNumerico} bpm).`;
      }
    }

    if (
      (nome.includes('oxig') || nome.includes('spo')) &&
      typeof valorNumerico === 'number'
    ) {
      if (valorNumerico < 95) {
        return `Alerta de Oxigenação: SpO₂ abaixo do nível seguro (${valorNumerico}%).`;
      }
    }

    if (nome.includes('temp') && typeof valorNumerico === 'number') {
      if (valorNumerico >= 37.3) {
        return `Alerta de Temperatura: Estado febril / febre detectada (${valorNumerico} °C).`;
      }
      if (valorNumerico < 35.5) {
        return `Alerta de Hipotermia: Temperatura corporal abaixo do padrão (${valorNumerico} °C).`;
      }
    }

    if (nome.includes('press') && valorCategorico) {
      const match = valorCategorico.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
      if (match) {
        const sist = Number(match[1]);
        const diast = Number(match[2]);
        if (sist >= 140 || diast >= 90) {
          return `Alerta de Pressão Arterial Elevada (${sist}/${diast} mmHg).`;
        }
        if (sist < 90 || diast < 60) {
          return `Alerta de Hipotensão: Pressão arterial baixa (${sist}/${diast} mmHg).`;
        }
      }
    }

    return null;
  }

  async create(data: any, authId: string) {
    const autorValidado = await this.validarAcesso(
      data.idoso_id,
      authId,
      'escrita',
    );

    const registro = await this.prisma.registro_saude.create({
      data: {
        idoso_id: data.idoso_id,
        indicador_id: data.indicador_id,
        valor_numerico: data.valor_numerico,
        valor_categorico: data.valor_categorico,
        origem: data.origem,
        usuario_id: data.origem === 'MANUAL' ? autorValidado.id : null,
        dispositivo_id: data.dispositivo_id || null,
      },
      include: { indicador_saude: true, usuario: true },
    });

    this.tempoReal.emitirNovoRegistro(data.idoso_id, registro);

    const alertaMsg = this.verificarAlertaCritico(
      registro.indicador_saude?.nome || '',
       data.valor_numerico,
      data.valor_categorico,
    );

    if (alertaMsg) {
      this.tempoReal.emitirAlerta(data.idoso_id, alertaMsg);
    }

    return registro;
  }

  async findByIdosoSeguro(idosoId: string, authId: string) {
    await this.validarAcesso(idosoId, authId, 'leitura');

    return this.prisma.registro_saude.findMany({
      where: { idoso_id: idosoId },
      orderBy: { data_hora: 'desc' },
      include: { indicador_saude: true, usuario: true },
    });
  }


  async createLote(dto: CreateRegistroSaudeLoteDto, authId: string) {
    const TOLERANCIA_FUTURO_MS = 5 * 60 * 1000;
    const IDADE_MAXIMA_MS = 30 * 24 * 60 * 60 * 1000;
    const JANELA_TEMPO_REAL_MS = 30 * 60 * 1000;

    await this.validarAcesso(dto.idoso_id, authId, 'escrita');

    const dispositivo = await this.prisma.dispositivo_vestivel.findUnique({
      where: { id: dto.dispositivo_id },
    });
    if (!dispositivo || dispositivo.idoso_id !== dto.idoso_id) {
      throw new ForbiddenException(
        'Este dispositivo nao esta vinculado a este paciente.',
      );
    }

    const agora = Date.now();
    const leituras = dto.leituras.map((leitura, indice) => {
      const numero = indice + 1;
      const quando = new Date(leitura.data_hora);
      if (Number.isNaN(quando.getTime())) {
        throw new BadRequestException(`Leitura ${numero}: data_hora invalida.`);
      }
      if (quando.getTime() > agora + TOLERANCIA_FUTURO_MS) {
        throw new BadRequestException(
          `Leitura ${numero}: data_hora esta no futuro.`,
        );
      }
      if (quando.getTime() < agora - IDADE_MAXIMA_MS) {
        throw new BadRequestException(
          `Leitura ${numero}: data_hora tem mais de 30 dias.`,
        );
      }
      if (leitura.valor_numerico == null && !leitura.valor_categorico) {
        throw new BadRequestException(
          `Leitura ${numero}: informe valor_numerico ou valor_categorico.`,
        );
      }
      return { ...leitura, quando };
    });

    const idsIndicadores = Array.from(
      new Set(leituras.map((l) => l.indicador_id)),
    );
    const indicadores = await this.prisma.indicador_saude.findMany({
      where: { id: { in: idsIndicadores } },
    });
    if (indicadores.length !== idsIndicadores.length) {
      throw new BadRequestException('Algum indicador_id informado nao existe.');
    }
    const nomePorId = new Map(
      indicadores.map((i) => [i.id, i.nome] as [string, string]),
    );

    // Descarta leituras que ja existem ou que se repetem dentro do proprio lote
    const chave = (indicadorId: string, quando: Date) =>
      `${indicadorId}|${quando.getTime()}`;
    const menor = new Date(Math.min(...leituras.map((l) => l.quando.getTime())));
    const maior = new Date(Math.max(...leituras.map((l) => l.quando.getTime())));

    const existentes = await this.prisma.registro_saude.findMany({
      where: {
        idoso_id: dto.idoso_id,
        dispositivo_id: dto.dispositivo_id,
        indicador_id: { in: idsIndicadores },
        data_hora: { gte: menor, lte: maior },
      },
      select: { indicador_id: true, data_hora: true },
    });
    const jaVistas = new Set(
      existentes.map((e) => chave(e.indicador_id, e.data_hora)),
    );

    const novas: typeof leituras = [];
    for (const leitura of leituras) {
      const k = chave(leitura.indicador_id, leitura.quando);
      if (jaVistas.has(k)) continue;
      jaVistas.add(k);
      novas.push(leitura);
    }

    if (novas.length > 0) {
      await this.prisma.registro_saude.createMany({
        data: novas.map((l) => ({
          idoso_id: dto.idoso_id,
          indicador_id: l.indicador_id,
          valor_numerico: l.valor_numerico ?? null,
          valor_categorico: l.valor_categorico ?? null,
          data_hora: l.quando,
          origem: 'AUTOMATICO' as const,
          usuario_id: null,
          dispositivo_id: dto.dispositivo_id,
        })),
      });
    }

    // Tempo real e alerta so para a leitura mais recente de cada indicador
    const maisRecente = new Map<string, (typeof leituras)[number]>();
    for (const leitura of novas) {
      const atual = maisRecente.get(leitura.indicador_id);
      if (!atual || leitura.quando > atual.quando) {
        maisRecente.set(leitura.indicador_id, leitura);
      }
    }

    for (const leitura of Array.from(maisRecente.values())) {
      if (agora - leitura.quando.getTime() > JANELA_TEMPO_REAL_MS) continue;

      const registro = await this.prisma.registro_saude.findFirst({
        where: {
          idoso_id: dto.idoso_id,
          dispositivo_id: dto.dispositivo_id,
          indicador_id: leitura.indicador_id,
          data_hora: leitura.quando,
        },
        include: { indicador_saude: true, usuario: true },
      });
      if (!registro) continue;

      this.tempoReal.emitirNovoRegistro(dto.idoso_id, registro);

      const alerta = this.verificarAlertaCritico(
        nomePorId.get(leitura.indicador_id) ?? '',
        leitura.valor_numerico,
        leitura.valor_categorico,
      );
      if (alerta) this.tempoReal.emitirAlerta(dto.idoso_id, alerta);
    }

    return {
      recebidas: leituras.length,
      gravadas: novas.length,
      ignoradas_duplicadas: leituras.length - novas.length,
    };
  }
}