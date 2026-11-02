import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegistroDoseService {
  constructor(private prisma: PrismaService) {}

  private async validarAcesso(idosoId: string, authId: string) {
    const usuarioLogado = await this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });
    
    if (!usuarioLogado) {
      throw new ForbiddenException('Usuário inválido.');
    }

    if (usuarioLogado.perfil === 'ADMINISTRADOR') {
      throw new ForbiddenException(
        'Administradores não possuem permissão clínica para confirmar medicações.',
      );
    }

    // Verifica se o usuário tem vínculo com o paciente
    const vinculo = await this.prisma.usuario_idoso.findFirst({
      where: { usuario_id: usuarioLogado.id, idoso_id: idosoId },
    });

    if (!vinculo) {
      throw new ForbiddenException(
        'Acesso negado: você não tem vínculo com este paciente.',
      );
    }

    // RN04: Apenas quem cuida diretamente pode confirmar
    if (usuarioLogado.perfil === 'FAMILIAR') {
      throw new ForbiddenException(
        'Familiares possuem permissão apenas de leitura do prontuário (RN02).',
      );
    }

    return usuarioLogado;
  }

  async registrarDose(data: {
    prescricao_id: string;
    status: 'CONFIRMADA' | 'RECUSADA' | 'ATRASADA';
    observacao?: string;
  }, authId: string) {
    
    // 1. Busca a prescrição para saber de qual idoso é
    const prescricao = await this.prisma.prescricao.findUnique({
      where: { id: data.prescricao_id },
    });

    if (!prescricao) {
      throw new NotFoundException('Prescrição não encontrada.');
    }

    if (prescricao.status === 'ENCERRADA') {
      throw new BadRequestException('Não é possível registrar doses de uma prescrição encerrada.');
    }

    // 2. Valida quem está tentando registrar a dose
    const autorValidado = await this.validarAcesso(prescricao.idoso_id, authId);

    // 3. Grava no banco a ação exata e o momento (RN05)
    return this.prisma.registro_dose.create({
      data: {
        prescricao_id: data.prescricao_id,
        idoso_id: prescricao.idoso_id,
        usuario_id: autorValidado.id,
        status: data.status,
        observacao: data.observacao,
        data_hora: new Date(),
      },
      include: {
        prescricao: {
          include: { medicamento: true }
        },
        usuario: {
          select: { nome: true, perfil: true }
        }
      }
    });
  }

  // Permite listar o histórico de adesão de um paciente
  async listarHistoricoPaciente(idosoId: string, authId: string) {
    const usuarioLogado = await this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });

    if (!usuarioLogado || usuarioLogado.perfil === 'ADMINISTRADOR') {
      throw new ForbiddenException('Acesso negado.');
    }

    // Familiares PODEM visualizar o histórico (RN02)
    const vinculo = await this.prisma.usuario_idoso.findFirst({
      where: { usuario_id: usuarioLogado.id, idoso_id: idosoId },
    });

    if (!vinculo) {
      throw new ForbiddenException('Acesso negado: paciente não vinculado.');
    }

    return this.prisma.registro_dose.findMany({
      where: { idoso_id: idosoId },
      orderBy: { data_hora: 'desc' },
      include: {
        prescricao: {
          include: { medicamento: true }
        },
        usuario: {
          select: { nome: true, perfil: true }
        }
      }
    });
  }
}