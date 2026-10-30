import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private prisma: PrismaService,
  ) {}

  /**
   * 1. Login Tradicional (E-mail e Senha) com barreira institucional
   */
  async login(email: string, senha: string) {
    const emailLimpo = email.trim().toLowerCase();

    // 1.1 Autentica na infraestrutura do Supabase Auth
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email: emailLimpo,
      password: senha,
    });

    if (error || !data.user) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    // 1.2 Localiza a conta corporativa no PostgreSQL
    const usuarioBanco = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ auth_id: data.user.id }, { email: emailLimpo }],
      },
    });

    // 1.3 Barreira estrita: se não tiver registro prévio no Prisma, bloqueia
    if (!usuarioBanco) {
      throw new ForbiddenException(
        'Acesso negado. Este utilizador não possui pré-cadastro ativo na instituição.',
      );
    }

    if (usuarioBanco.status === 'BLOQUEADO') {
      throw new ForbiddenException('Conta institucional suspensa ou bloqueada.');
    }

    // 1.4 Se estiver PENDENTE no primeiro login ou sem auth_id, ativa a conta
    if (usuarioBanco.status === 'PENDENTE' || !usuarioBanco.auth_id) {
      await this.prisma.usuario.update({
        where: { id: usuarioBanco.id },
        data: {
          auth_id: data.user.id,
          status: 'ATIVO',
          provedor: 'EMAIL',
        },
      });
    }

    return {
      access_token: data.session.access_token,
      usuario: {
        id: usuarioBanco.id,
        nome: usuarioBanco.nome,
        email: usuarioBanco.email,
        perfil: usuarioBanco.perfil,
        clinica_id: usuarioBanco.clinica_id,
        foto_url: usuarioBanco.foto_url,
        status: 'ATIVO',
      },
    };
  }

  /**
   * 2. Login Social / SSO (Google e Microsoft) com barreira estrita 403
   */
  async ssoCallback(token: string, provedor: 'GOOGLE' | 'MICROSOFT') {
    // 2.1 Valida o token gerado pelo fluxo OAuth do Supabase
    const { data, error } = await this.supabase.client.auth.getUser(token);

    if (error || !data.user || !data.user.email) {
      throw new UnauthorizedException('Token SSO inválido ou expirado.');
    }

    const emailSocial = data.user.email.trim().toLowerCase();

    // 2.2 Consulta se a administração da clínica pré-cadastrou este e-mail
    const usuarioBanco = await this.prisma.usuario.findUnique({
      where: { email: emailSocial },
    });

    // BARREIRA 403: Sem pré-cadastro = acesso negado de imediato
    if (!usuarioBanco) {
      throw new ForbiddenException(
        'Acesso negado. A sua conta Google/Microsoft não possui pré-cadastro ativo na instituição.',
      );
    }

    if (usuarioBanco.status === 'BLOQUEADO') {
      throw new ForbiddenException('Conta institucional suspensa ou bloqueada.');
    }

    // 2.3 Ativa a conta corporativa e vincula o provedor SSO
    const usuarioAtualizado = await this.prisma.usuario.update({
      where: { id: usuarioBanco.id },
      data: {
        auth_id: data.user.id,
        status: 'ATIVO',
        provedor: provedor,
      },
    });

    return {
      access_token: token,
      usuario: {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        perfil: usuarioAtualizado.perfil,
        clinica_id: usuarioAtualizado.clinica_id,
        foto_url: usuarioAtualizado.foto_url,
        status: usuarioAtualizado.status,
      },
    };
  }

  /**
   * 3. Convite Corporativo (Disparado pelo Administrador da Clínica)
   */
  async convidarUtilizador(
    email: string,
    nome: string,
    perfil: any,
    clinicaId: string,
    cpf?: string,
    telefone?: string,
  ) {
    const emailLimpo = email.trim().toLowerCase();

    // 3.1 Verifica se o e-mail já existe no banco
    const existente = await this.prisma.usuario.findUnique({
      where: { email: emailLimpo },
    });

    if (existente) {
      throw new ForbiddenException('Este e-mail já se encontra registado no sistema.');
    }

    // 3.2 Dispara o convite seguro através do Supabase Auth Admin
    const { data, error } = await this.supabase.client.auth.admin.inviteUserByEmail(
      emailLimpo,
      { data: { nome, perfil } },
    );

    if (error) {
      throw new UnauthorizedException(
        `Falha ao disparar convite pelo Supabase: ${error.message}`,
      );
    }

    // 3.3 Regista o pré-cadastro com status PENDENTE no Prisma
    const novoUsuario = await this.prisma.usuario.create({
      data: {
        auth_id: data.user.id,
        nome: nome.trim(),
        email: emailLimpo,
        cpf: cpf ? cpf.replace(/\D/g, '') : undefined,
        telefone: telefone ? telefone.replace(/\D/g, '') : undefined,
        perfil: perfil,
        clinica_id: clinicaId,
        status: 'PENDENTE',
        provedor: 'EMAIL',
      },
    });

    return {
      message: 'Convite corporativo enviado com sucesso.',
      usuario: novoUsuario,
    };
  }
}