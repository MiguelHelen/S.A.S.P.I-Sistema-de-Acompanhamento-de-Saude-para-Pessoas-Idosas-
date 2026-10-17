import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private prisma: PrismaService,
  ) {}

  async login(email: string, senha: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword(
      { email: email.trim().toLowerCase(), password: senha },
    );

    if (error) {
      throw new UnauthorizedException('Email ou senha invalidos');
    }

    const usuarioBanco = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { auth_id: data.user.id },
          { email: email.trim().toLowerCase() },
        ],
      },
    });

    return {
      access_token: data.session.access_token,
      usuario: usuarioBanco || {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }
}