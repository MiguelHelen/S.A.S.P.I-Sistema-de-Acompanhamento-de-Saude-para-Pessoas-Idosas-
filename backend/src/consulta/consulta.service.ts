import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';

const STATUS_VALIDOS = ['Agendada', 'Confirmada', 'Realizada', 'Cancelada'];

@Injectable()
export class ConsultaService {
  constructor(private prisma: PrismaService) {}

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
        'Administradores não podem agendar ou alterar consultas clínicas.',
      );
    }

    if (usuarioLogado.perfil !== 'ADMINISTRADOR') {
      const vinculo = await this.prisma.usuario_idoso.findFirst({
        where: { usuario_id: usuarioLogado.id, idoso_id: idosoId },
      });
      if (!vinculo) {
        throw new ForbiddenException('Acesso negado: paciente não vinculado.');
      }
    }

    if (operacao === 'escrita' && usuarioLogado.perfil === 'FAMILIAR') {
      throw new ForbiddenException(
        'Familiares possuem permissão apenas de leitura.',
      );
    }

    return usuarioLogado;
  }

  async create(dto: CreateConsultaDto, authId: string) {
    if (!dto.idoso_id) {
      throw new BadRequestException('ID do paciente obrigatório.');
    }

    const autorValidado = await this.validarAcesso(
      dto.idoso_id,
      authId,
      'escrita',
    );

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO public.consulta (idoso_id, usuario_id, especialidade, medico, data, horario, localizacao, observacao, status)
       VALUES ($1::uuid, $2::uuid, $3, $4, $5::date, $6, $7, $8, $9)
       RETURNING *`,
      dto.idoso_id,
      dto.usuario_id || autorValidado.id,
      dto.especialidade.trim(),
      dto.medico.trim(),
      dto.data,
      dto.horario.trim(),
      dto.localizacao.trim(),
      dto.observacao ? dto.observacao.trim() : null,
      dto.status || 'Agendada',
    );
    return rows[0];
  }

  async findAllSeguro(idosoId: string, authId: string) {
    await this.validarAcesso(idosoId, authId, 'leitura');
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.consulta WHERE idoso_id = $1::uuid ORDER BY data ASC, horario ASC`,
      idosoId,
    );
  }

  async updateStatus(id: string, status: string, authId: string) {
    if (!STATUS_VALIDOS.includes(status)) {
      throw new BadRequestException(
        `Status inválido. Valores permitidos: ${STATUS_VALIDOS.join(', ')}`,
      );
    }

    const consultaCheck = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, idoso_id FROM public.consulta WHERE id = $1::uuid`,
      id,
    );
    if (!consultaCheck || consultaCheck.length === 0) {
      throw new NotFoundException('Consulta não encontrada');
    }

    await this.validarAcesso(consultaCheck[0].idoso_id, authId, 'escrita');

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE public.consulta SET status = $1 WHERE id = $2::uuid RETURNING *`,
      status,
      id,
    );
    return rows[0];
  }

  async remove(id: string, authId: string) {
    const consultaCheck = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, idoso_id FROM public.consulta WHERE id = $1::uuid`,
      id,
    );
    if (!consultaCheck || consultaCheck.length === 0) {
      throw new NotFoundException('Consulta não encontrada');
    }

    await this.validarAcesso(consultaCheck[0].idoso_id, authId, 'escrita');

    // RN08 (Soft Delete): Preserva o registro no histórico marcando como Cancelada
    await this.prisma.$queryRawUnsafe(
      `UPDATE public.consulta SET status = $1 WHERE id = $2::uuid`,
      'Cancelada',
      id,
    );
    return { deleted: true, status: 'Cancelada' };
  }
}