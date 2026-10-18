import { Injectable, ForbiddenException } from '@nestjs/common';
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
}