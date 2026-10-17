import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsuarioService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async create(dto: {
    nome: string;
    email: string;
    senha: string;
    cpf?: string;
    telefone?: string;
    perfil: string;
    clinica_id: string;
  }) {
    const emailLimpo = dto.email.trim().toLowerCase();
    const cpfLimpo = dto.cpf ? dto.cpf.replace(/\D/g, '') : undefined;

    if (cpfLimpo && cpfLimpo.length !== 11) {
      throw new BadRequestException('O CPF informado deve conter 11 digitos.');
    }

    const emailExistente = await this.prisma.usuario.findUnique({ where: { email: emailLimpo } });
    if (emailExistente) throw new ConflictException('Este e-mail ja esta cadastrado no sistema.');

    if (cpfLimpo) {
      const cpfExistente = await this.prisma.usuario.findUnique({ where: { cpf: cpfLimpo } });
      if (cpfExistente) throw new ConflictException('Este CPF ja esta cadastrado no sistema.');
    }

    // Passo 1: Criação no Supabase Auth
    const { data, error } = await this.supabase.client.auth.admin.createUser({
      email: emailLimpo,
      password: dto.senha,
      email_confirm: true,
    });

    if (error) {
      throw new BadRequestException(`Falha ao criar credencial de acesso: ${error.message}`);
    }

    const newAuthId = data.user.id;

    // Passo 2: Gravação no Banco de Negócio com Rollback manual
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
    } catch (dbError) {
      // ROLLBACK: Se o Prisma falhou, apaga o usuário do Supabase para evitar sujeira/fantasmas
      await this.supabase.client.auth.admin.deleteUser(newAuthId).catch(() => null);
      throw new InternalServerErrorException('Falha ao gravar no banco. Criação desfeita.');
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
  ) {
    const atual = await this.prisma.usuario.findUnique({ where: { id } });
    if (!atual) {
      throw new NotFoundException('Usuario nao encontrado.');
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
        ...(data.perfil !== undefined && { perfil: data.perfil as any }),
      },
    });
  }

  async remove(id: string) {
    const atual = await this.prisma.usuario.findUnique({ where: { id } });
    if (!atual) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    // Primeiro tenta deletar a regra de negócio (se falhar pela FK constraint, o Auth fica intacto)
    await this.prisma.usuario.delete({ where: { id } });

    // Se passou do Prisma, a deleção é concluída tirando do Supabase
    if (atual.auth_id) {
      await this.supabase.client.auth.admin.deleteUser(atual.auth_id).catch(() => null);
    }

    return { deleted: true };
  }
}