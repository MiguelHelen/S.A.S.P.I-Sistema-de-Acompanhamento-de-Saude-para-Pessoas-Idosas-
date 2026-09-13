import { Injectable } from '@nestjs/common';
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
    // 1) cria a conta de login no Supabase Auth
    const { data, error } = await this.supabase.client.auth.admin.createUser({
      email: dto.email,
      password: dto.senha,
      email_confirm: true,
    });

    if (error) {
      throw new Error(`Erro ao criar usuário no Auth: ${error.message}`);
    }

    // 2) salva o registro na nossa tabela, vinculando ao auth_id gerado
    return this.prisma.usuario.create({
      data: {
        auth_id: data.user.id,
        nome: dto.nome,
        cpf: dto.cpf,
        email: dto.email,
        telefone: dto.telefone,
        perfil: dto.perfil as any,
        clinica_id: dto.clinica_id,
      },
    });
  }

  findAll() {
    return this.prisma.usuario.findMany();
  }

  findOne(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }
}