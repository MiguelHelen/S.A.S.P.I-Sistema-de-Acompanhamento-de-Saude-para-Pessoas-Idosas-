import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  async login(email: string, senha: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword(
      { email, password: senha },
    );

    if (error) {
      throw new UnauthorizedException('Email ou senha invalidos');
    }

    return {
      access_token: data.session.access_token,
      usuario: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }
}