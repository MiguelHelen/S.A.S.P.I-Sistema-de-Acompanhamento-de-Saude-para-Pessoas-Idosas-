import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, SupabaseModule, AuthModule],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule {}