import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrescricaoService {
  constructor(private prisma: PrismaService) {}

  private async validarAcesso(idosoId: string, authId: string, operacao: 'leitura' | 'escrita') {
    const usuarioLogado = await this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });
    if (!usuarioLogado) throw new ForbiddenException('Usuário inválido.');

    if (usuarioLogado.perfil === 'ADMINISTRADOR' && operacao === 'escrita') {
      throw new ForbiddenException('Administradores não podem registrar prescrições clínicas.');
    }

    if (usuarioLogado.perfil !== 'ADMINISTRADOR') {
      const vinculo = await this.prisma.usuario_idoso.findFirst({
        where: { usuario_id: usuarioLogado.id, idoso_id: idosoId },
      });
      if (!vinculo) {
        throw new ForbiddenException('Acesso negado: você não tem vínculo com este paciente.');
      }
    }

    if (operacao === 'escrita' && usuarioLogado.perfil !== 'MEDICO') {
      throw new ForbiddenException(
        'Apenas Médicos possuem permissão clínica para registrar ou encerrar prescrições de medicamentos.',
      );
    }

    return usuarioLogado;
  }

  async create(data: any, authId: string) {
    const autorValidado = await this.validarAcesso(data.idoso_id, authId, 'escrita');

    return this.prisma.prescricao.create({
      data: {
        idoso_id: data.idoso_id,
        medicamento_id: data.medicamento_id,
        usuario_id: autorValidado.id,
        dosagem: data.dosagem,
        frequencia: data.frequencia,
        status: data.status || 'ATIVA',
        data_inicio: data.data_inicio ? new Date(data.data_inicio) : undefined,
        data_fim: data.data_fim ? new Date(data.data_fim) : undefined,
      },
      include: { medicamento: true, usuario: true },
    });
  }

  async findByIdosoSeguro(idosoId: string, authId: string) {
    await this.validarAcesso(idosoId, authId, 'leitura');
    return this.prisma.prescricao.findMany({
      where: { idoso_id: idosoId },
      orderBy: { data_inicio: 'desc' },
      include: { medicamento: true, usuario: true },
    });
  }

  findAll(idosoId?: string) {
    return this.prisma.prescricao.findMany({
      where: idosoId ? { idoso_id: idosoId } : undefined,
      orderBy: { data_inicio: 'desc' },
      include: {
        medicamento: true,
        usuario: true,
      },
    });
  }

  findByIdoso(idosoId: string) {
    return this.prisma.prescricao.findMany({
      where: { idoso_id: idosoId },
      orderBy: { data_inicio: 'desc' },
      include: {
        medicamento: true,
        usuario: true,
      },
    });
  }

  async encerrar(id: string, authId: string) {
    const prescricao = await this.prisma.prescricao.findUnique({ where: { id } });
    if (!prescricao) throw new NotFoundException('Prescrição não encontrada');

    await this.validarAcesso(prescricao.idoso_id, authId, 'escrita');

    return this.prisma.prescricao.update({
      where: { id },
      data: { status: 'ENCERRADA', data_fim: new Date() },
      include: { medicamento: true, usuario: true },
    });
  }
}