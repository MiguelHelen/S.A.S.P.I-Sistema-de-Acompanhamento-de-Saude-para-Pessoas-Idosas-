import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdosoService {
  constructor(private prisma: PrismaService) {}

  private async exigirAdministrador(authId?: string) {
    if (!authId) return;
    const user = await this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });
    if (!user || user.perfil !== 'ADMINISTRADOR') {
      throw new ForbiddenException(
        'Apenas Administradores podem cadastrar, editar ou excluir pacientes da instituição.',
      );
    }
  }

  private validarDataNascimento(dataStr: string): Date {
    const nasc = new Date(dataStr);
    const hoje = new Date();
    const ano = nasc.getUTCFullYear();

    if (Number.isNaN(nasc.getTime()) || ano < 1900 || nasc > hoje) {
      throw new BadRequestException(
        'Data de nascimento invalida. Informe uma data real entre 1900 e a data atual.',
      );
    }
    return nasc;
  }

  async create(
    data: {
      nome: string;
      cpf?: string;
      data_nascimento: string;
      sexo?: string;
      telefone?: string;
      endereco?: string;
      clinica_id: string;
    },
    authId?: string,
  ) {
    await this.exigirAdministrador(authId);

    const dataNascValida = this.validarDataNascimento(data.data_nascimento);
    const cpfLimpo = data.cpf ? data.cpf.replace(/\D/g, '') : undefined;

    if (cpfLimpo && cpfLimpo.length !== 11) {
      throw new BadRequestException('O CPF do paciente deve conter 11 digitos.');
    }

    if (cpfLimpo) {
      const existente = await this.prisma.idoso.findUnique({
        where: { cpf: cpfLimpo },
      });
      if (existente) {
        throw new ConflictException(
          'Ja existe um paciente cadastrado com este CPF no sistema.',
        );
      }
    }

    return this.prisma.idoso.create({
      data: {
        nome: data.nome.trim(),
        cpf: cpfLimpo || null,
        data_nascimento: dataNascValida,
        sexo: data.sexo || null,
        telefone: data.telefone ? data.telefone.replace(/\D/g, '') : null,
        endereco: data.endereco ? data.endereco.trim() : null,
        clinica_id: data.clinica_id,
      },
    });
  }

  async findAllSeguro(clinicaId: string, authId: string) {
    await this.exigirAdministrador(authId);
    return this.prisma.idoso.findMany({
      where: { clinica_id: clinicaId },
      orderBy: { nome: 'asc' },
    });
  }

  findAll(clinicaId?: string) {
    return this.prisma.idoso.findMany({
      where: clinicaId ? { clinica_id: clinicaId } : undefined,
      orderBy: { nome: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.idoso.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: {
      nome?: string;
      cpf?: string;
      data_nascimento?: string;
      sexo?: string;
      telefone?: string;
      endereco?: string;
    },
    authId?: string,
  ) {
    await this.exigirAdministrador(authId);

    const atual = await this.prisma.idoso.findUnique({ where: { id } });
    if (!atual) {
      throw new NotFoundException('Paciente nao encontrado.');
    }

    const cpfLimpo =
      data.cpf !== undefined ? data.cpf.replace(/\D/g, '') : undefined;

    if (cpfLimpo && cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
      throw new BadRequestException('O CPF do paciente deve conter 11 digitos.');
    }

    if (cpfLimpo && cpfLimpo.length === 11 && cpfLimpo !== atual.cpf) {
      const colisao = await this.prisma.idoso.findUnique({
        where: { cpf: cpfLimpo },
      });
      if (colisao && colisao.id !== id) {
        throw new ConflictException(
          'Ja existe outro paciente cadastrado com este CPF.',
        );
      }
    }

    const novaDataNasc = data.data_nascimento
      ? this.validarDataNascimento(data.data_nascimento)
      : undefined;

    return this.prisma.idoso.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome.trim() }),
        ...(cpfLimpo !== undefined && {
          cpf: cpfLimpo.length > 0 ? cpfLimpo : null,
        }),
        ...(novaDataNasc !== undefined && { data_nascimento: novaDataNasc }),
        ...(data.sexo !== undefined && { sexo: data.sexo }),
        ...(data.telefone !== undefined && {
          telefone:
            data.telefone.replace(/\D/g, '').length > 0
              ? data.telefone.replace(/\D/g, '')
              : null,
        }),
        ...(data.endereco !== undefined && {
          endereco: data.endereco.trim().length > 0 ? data.endereco.trim() : null,
        }),
      },
    });
  }

  async remove(id: string, authId?: string) {
    await this.exigirAdministrador(authId);

    const atual = await this.prisma.idoso.findUnique({ where: { id } });
    if (!atual) {
      throw new NotFoundException('Paciente nao encontrado.');
    }

    // RN08: Impede exclusão física caso o paciente já possua prontuário clínico
    const [qtdRegistros, qtdPrescricoes, rowsConsultas] = await Promise.all([
      this.prisma.registro_saude.count({ where: { idoso_id: id } }),
      this.prisma.prescricao.count({ where: { idoso_id: id } }),
      this.prisma.$queryRawUnsafe<{ total: number }[]>(
        `SELECT COUNT(*)::int AS total FROM public.consulta WHERE idoso_id = $1::uuid`,
        id,
      ),
    ]);

    const qtdConsultas = Number(rowsConsultas?.[0]?.total || 0);

    if (qtdRegistros > 0 || qtdPrescricoes > 0 || qtdConsultas > 0) {
      throw new ConflictException(
        'Não é possível excluir este paciente pois ele possui registros clínicos, prescrições ou agendamentos vinculados no prontuário (RN08).',
      );
    }

    return this.prisma.idoso.delete({ where: { id } });
  }
}