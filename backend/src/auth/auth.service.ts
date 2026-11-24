import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { PrismaService } from "../prisma/prisma.service";

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

    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email: emailLimpo,
      password: senha,
    });

    if (error || !data.user || !data.session) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }

    const usuarioBanco = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ auth_id: data.user.id }, { email: emailLimpo }],
      },
    });

    if (!usuarioBanco) {
      throw new ForbiddenException(
        "Acesso negado. Este utilizador não possui pré-cadastro ativo na instituição.",
      );
    }

    if (usuarioBanco.status === "BLOQUEADO") {
      throw new ForbiddenException(
        "Conta institucional suspensa ou bloqueada.",
      );
    }

    if (usuarioBanco.status === "PENDENTE" || !usuarioBanco.auth_id) {
      await this.prisma.usuario.update({
        where: { id: usuarioBanco.id },
        data: {
          auth_id: data.user.id,
          status: "ATIVO",
          provedor: "EMAIL",
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
        status: "ATIVO",
      },
    };
  }

  /**
   * 2. Login Social / SSO (Google e Microsoft) com barreira estrita 403
   */
  async ssoCallback(token: string, provedor: "GOOGLE" | "MICROSOFT") {
    const { data, error } = await this.supabase.client.auth.getUser(token);

    if (error || !data.user || !data.user.email) {
      throw new UnauthorizedException("Token SSO inválido ou expirado.");
    }

    const emailSocial = data.user.email.trim().toLowerCase();

    const usuarioBanco = await this.prisma.usuario.findUnique({
      where: { email: emailSocial },
    });

    if (!usuarioBanco) {
      throw new ForbiddenException(
        "Acesso negado. A sua conta Google/Microsoft não possui pré-cadastro ativo na instituição.",
      );
    }

    if (usuarioBanco.status === "BLOQUEADO") {
      throw new ForbiddenException(
        "Conta institucional suspensa ou bloqueada.",
      );
    }

    const usuarioAtualizado = await this.prisma.usuario.update({
      where: { id: usuarioBanco.id },
      data: {
        auth_id: data.user.id,
        status: "ATIVO",
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
   * 3. Convite Corporativo (Exclusivo para Administrador da Clínica)
   */
  async convidarUtilizador(
    email: string,
    nome: string,
    perfil: any,
    clinicaId: string,
    cpf?: string,
    telefone?: string,
    authIdSolicitante?: string,
  ) {
    if (authIdSolicitante) {
      const solicitante = await this.prisma.usuario.findUnique({
        where: { auth_id: authIdSolicitante },
      });
      if (!solicitante || solicitante.perfil !== "ADMINISTRADOR") {
        throw new ForbiddenException(
          "Apenas Administradores podem enviar convites de acesso.",
        );
      }
    }

    const emailLimpo = email.trim().toLowerCase();

    const existente = await this.prisma.usuario.findUnique({
      where: { email: emailLimpo },
    });

    if (existente) {
      throw new ForbiddenException(
        "Este e-mail já se encontra registado no sistema.",
      );
    }

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "https://s-a-s-p-i-sistema-de-acompanhamento.vercel.app";

    const { data, error } =
      await this.supabase.client.auth.admin.inviteUserByEmail(emailLimpo, {
        data: { nome, perfil },
        redirectTo: `${frontendUrl}/redefinir-senha`,
      });

    if (error) {
      throw new UnauthorizedException(
        `Falha ao disparar convite pelo Supabase: ${error.message}`,
      );
    }

    const novoUsuario = await this.prisma.usuario.create({
      data: {
        auth_id: data.user.id,
        nome: nome.trim(),
        email: emailLimpo,
        cpf: cpf ? cpf.replace(/\D/g, "") : undefined,
        telefone: telefone ? telefone.replace(/\D/g, "") : undefined,
        perfil: perfil,
        clinica_id: clinicaId,
        status: "PENDENTE",
        provedor: "EMAIL",
      },
    });

    return {
      message: "Convite corporativo enviado com sucesso.",
      usuario: novoUsuario,
    };
  }

  /**
   * 4. Criação de Acesso Mobile para Idoso (Senha definida pelo Administrador)
   */
  async criarAcessoIdoso(
    idosoId: string,
    email: string,
    senha: string,
    clinicaId?: string,
    authIdSolicitante?: string,
  ) {
    if (authIdSolicitante) {
      const solicitante = await this.prisma.usuario.findUnique({
        where: { auth_id: authIdSolicitante },
      });
      if (!solicitante || solicitante.perfil !== "ADMINISTRADOR") {
        throw new ForbiddenException(
          "Apenas Administradores podem criar acesso mobile para idosos.",
        );
      }
    }

    const emailLimpo = email.trim().toLowerCase();

    if (!senha || senha.length < 6) {
      throw new ForbiddenException("A senha deve ter no mínimo 6 caracteres.");
    }

    // 4.1 Busca os dados já cadastrados do idoso
    const idoso = await this.prisma.idoso.findUnique({
      where: { id: idosoId },
    });

    if (!idoso) {
      throw new NotFoundException("Idoso não encontrado no sistema.");
    }

    if (clinicaId && idoso.clinica_id !== clinicaId) {
      throw new ForbiddenException("Este idoso pertence a outra clínica.");
    }

    // 4.2 Verifica se o idoso já possui conta própria vinculada
    const vinculoExistente = await this.prisma.usuario_idoso.findFirst({
      where: {
        idoso_id: idosoId,
        tipo_vinculo: "PROPRIO_IDOSO",
      },
    });

    if (vinculoExistente) {
      throw new ForbiddenException(
        "Este idoso já possui uma conta de acesso ao aplicativo vinculada.",
      );
    }

    // 4.3 Verifica se o e-mail já está em uso na tabela usuario
    const emailExistente = await this.prisma.usuario.findUnique({
      where: { email: emailLimpo },
    });

    if (emailExistente) {
      throw new ForbiddenException(
        "Este e-mail já está cadastrado no sistema.",
      );
    }

    // 4.4 Cria o login já confirmado no Supabase Auth
    const { data: authData, error: authError } =
      await this.supabase.client.auth.admin.createUser({
        email: emailLimpo,
        password: senha,
        email_confirm: true,
        user_metadata: {
          nome: idoso.nome,
          perfil: "IDOSO",
        },
      });

    if (authError || !authData.user) {
      throw new UnauthorizedException(
        `Erro ao criar credencial no Supabase Auth: ${authError?.message || "Erro desconhecido"}`,
      );
    }

    // 4.5 Cria o usuário e o vínculo no PostgreSQL dentro de uma transação
    try {
      const resultado = await this.prisma.$transaction(async (tx) => {
        const novoUsuario = await tx.usuario.create({
          data: {
            auth_id: authData.user.id,
            nome: idoso.nome,
            cpf: idoso.cpf ?? undefined,
            telefone: idoso.telefone ?? undefined,
            foto_url: idoso.foto_url ?? undefined,
            email: emailLimpo,
            perfil: "IDOSO",
            clinica_id: idoso.clinica_id,
            status: "ATIVO",
            provedor: "EMAIL",
          },
        });

        const novoVinculo = await tx.usuario_idoso.create({
          data: {
            usuario_id: novoUsuario.id,
            idoso_id: idoso.id,
            tipo_vinculo: "PROPRIO_IDOSO",
          },
        });

        return { usuario: novoUsuario, vinculo: novoVinculo };
      });

      return {
        message: "Acesso mobile do idoso criado e vinculado com sucesso.",
        ...resultado,
      };
    } catch (dbError: any) {
      // Rollback no Supabase Auth caso a gravação no banco falhe
      await this.supabase.client.auth.admin.deleteUser(authData.user.id);
      throw new ForbiddenException(
        `Falha ao salvar dados no banco: ${dbError.message}`,
      );
    }
  }
}
