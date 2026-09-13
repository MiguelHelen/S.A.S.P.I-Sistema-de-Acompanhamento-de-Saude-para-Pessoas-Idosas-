import { Module } from '@nestjs/common';
import { RegistroSaudeService } from './registro-saude.service';
import { RegistroSaudeController } from './registro-saude.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TempoRealModule } from '../tempo-real/tempo-real.module';

@Module({
  imports: [PrismaModule, AuthModule, TempoRealModule],
  controllers: [RegistroSaudeController],
  providers: [RegistroSaudeService],
})
export class RegistroSaudeModule {}