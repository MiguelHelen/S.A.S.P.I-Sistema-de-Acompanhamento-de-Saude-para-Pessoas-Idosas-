import { Module } from '@nestjs/common';
import { UsuarioIdosoService } from './usuario-idoso.service';
import { UsuarioIdosoController } from './usuario-idoso.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsuarioIdosoController],
  providers: [UsuarioIdosoService],
})
export class UsuarioIdosoModule {}