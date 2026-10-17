import { Module } from '@nestjs/common';
import { PrescricaoService } from './prescricao.service';
import { PrescricaoController } from './prescricao.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PrescricaoController],
  providers: [PrescricaoService],
})
export class PrescricaoModule {}