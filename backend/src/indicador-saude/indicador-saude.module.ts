import { Module } from '@nestjs/common';
import { IndicadorSaudeService } from './indicador-saude.service';
import { IndicadorSaudeController } from './indicador-saude.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [IndicadorSaudeController],
  providers: [IndicadorSaudeService],
})
export class IndicadorSaudeModule {}