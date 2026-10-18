import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsuarioService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  private async obterUsuarioLogado(authId?: string) {
    if (!authId) return null;
    return this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });
  }

  async create(
    dto: {
      nome: string;
      email: string;
      senha: string;
      cpf?: string;
      telefone?: string;
      perfil: string;
      clinica_id: string;
    },
    authId?: string,
  ) {
    const solicitante = await this.obterUsuarioLogado(authId);
    if (solicitante && solicitante.perfil !== 'ADMINISTRADOR') {
      throw new ForbiddenException(
        'Apenas Administradores podem cadastrar novos usuários na instituição.',
      );
    }

    const emailLimpo = dto.email.trim().toLowerCase();
    const cpfLimpo = dto.cpf ? dto.cpf.replace(/\D/g, '') : undefined;

    if (cpfLimpo && cpfLimpo.length !== 11) {
      throw new BadRequestException('O CPF informado deve conter 11 digitos.');
    }

    const emailExistente = await this.prisma.usuario.findUnique({
      where: { email: emailLimpo },
    });
    if (emailExistente)
      throw new ConflictException('Este e-mail ja esta cadastrado no sistema.');

    if (cpfLimpo) {
      const cpfExistente = await this.prisma.usuario.findUnique({
        where: { cpf: cpfLimpo },
      });
      if (cpfExistente)
        throw new ConflictException('Este CPF ja esta cadastrado no sistema.');
    }

    const { data, error } = await this.supabase.client.auth.admin.createUser({
      email: emailLimpo,
      password: dto.senha,
      email_confirm: true,
    });

    if (error) {
      throw new BadRequestException(
        `Falha ao criar credencial de acesso: ${error.message}`,
      );
    }

    const newAuthId = data.user.id;

    try {
      return await this.prisma.usuario.create({
        data: {
          auth_id: newAuthId,
          nome: dto.nome.trim(),
          cpf: cpfLimpo || null,
          email: emailLimpo,
          telefone: dto.telefone ? dto.telefone.replace(/\D/g, '') : null,
          perfil: dto.perfil as any,
          clinica_id: dto.clinica_id,
        },
      });
    } catch {
      await this.supabase.client.auth.admin
        .deleteUser(newAuthId)
        .catch(() => null);
      throw new InternalServerErrorException(
        'Falha ao gravar no banco. Criação desfeita.',
      );
    }
  }

  findAll(clinicaId?: string, email?: string) {
    const where: any = {};
    if (clinicaId) where.clinica_id = clinicaId;
    if (email) where.email = email.trim().toLowerCase();

    return this.prisma.usuario.findMany({
      where,
      orderBy: { nome: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: {
      nome?: string;
      cpf?: string;
      telefone?: string;
      perfil?: string;
    },
    authId?: string,
  ) {
    const atual = await this.prisma.usuario.findUnique({ where: { id } });
    if (!atual) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    const solicitante = await this.obterUsuarioLogado(authId);
    const isAdmin = solicitante?.perfil === 'ADMINISTRADOR';

    if (solicitante && !isAdmin && solicitante.id !== id) {
      throw new ForbiddenException(
        'Você só possui permissão para editar os seus próprios dados de perfil.',
      );
    }

    if (
      data.perfil !== undefined &&
      data.perfil !== atual.perfil &&
      !isAdmin
    ) {
      throw new ForbiddenException(
        'Apenas Administradores podem alterar o nível de acesso (perfil) de um usuário.',
      );
    }

    const cpfLimpo =
      data.cpf !== undefined ? data.cpf.replace(/\D/g, '') : undefined;

    if (cpfLimpo && cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
      throw new BadRequestException('O CPF deve conter 11 digitos.');
    }

    if (cpfLimpo && cpfLimpo.length === 11 && cpfLimpo !== atual.cpf) {
      const colisao = await this.prisma.usuario.findUnique({
        where: { cpf: cpfLimpo },
      });
      if (colisao && colisao.id !== id) {
        throw new ConflictException(
          'Este CPF ja pertence a outro usuario cadastrado.',
        );
      }
    }

    return this.prisma.usuario.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome.trim() }),
        ...(cpfLimpo !== undefined && {
          cpf: cpfLimpo.length > 0 ? cpfLimpo : null,
        }),
        ...(data.telefone !== undefined && {
          telefone:
            data.telefone.replace(/\D/g, '').length > 0
              ? data.telefone.replace(/\D/g, '')
              : null,
        }),
        ...(isAdmin &&
          data.perfil !== undefined && { perfil: data.perfil as any }),
      },
    });
  }

  async remove(id: string, authId?: string) {
    const solicitante = await this.obterUsuarioLogado(authId);
    if (solicitante && solicitante.perfil !== 'ADMINISTRADOR') {
      throw new ForbiddenException(
        'Apenas Administradores podem remover usuários do sistema.',
      );
    }

    const atual = await this.prisma.usuario.findUnique({ where: { id } });
    if (!atual) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    // RN08: Verifica se o profissional possui registros clínicos vinculados
    const [qtdPrescricoes, qtdRegistros] = await Promise.all([
      this.prisma.prescricao.count({ where: { usuario_id: id } }),
      this.prisma.registro_saude.count({ where: { usuario_id: id } }),
    ]);

    if (qtdPrescricoes > 0 || qtdRegistros > 0) {
      throw new ConflictException(
        'Não é possível excluir este usuário pois ele possui prescrições ou registros clínicos vinculados no prontuário (RN08).',
      );
    }

    await this.prisma.usuario.delete({ where: { id } });

    if (atual.auth_id) {
      await this.supabase.client.auth.admin
        .deleteUser(atual.auth_id)
        .catch(() => null);
    }

    return { deleted: true };
  }
}