import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TempoRealGateway } from '../tempo-real/tempo-real.gateway';

@Injectable()
export class RegistroSaudeService {
  constructor(
    private prisma: PrismaService,
    private tempoReal: TempoRealGateway,
  ) {}

  private async validarAcesso(idosoId: string, authId: string, operacao: 'leitura' | 'escrita') {
    const usuarioLogado = await this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });

    if (!usuarioLogado) throw new ForbiddenException('Usuário inválido.');

    if (usuarioLogado.perfil === 'ADMINISTRADOR' && operacao === 'escrita') {
      throw new ForbiddenException('Administradores não podem inserir aferições.');
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

  async create(data: any, authId: string) {
    const autorValidado = await this.validarAcesso(data.idoso_id, authId, 'escrita');

    const registro = await this.prisma.registro_saude.create({
      data: {
        idoso_id: data.idoso_id,
        indicador_id: data.indicador_id,
        valor_numerico: data.valor_numerico,
        valor_categorico: data.valor_categorico,
        origem: data.origem,
        usuario_id: data.origem === 'MANUAL' ? autorValidado.id : null,
      },
      include: { indicador_saude: true, usuario: true },
    });

    this.tempoReal.emitirNovoRegistro(data.idoso_id, registro);
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