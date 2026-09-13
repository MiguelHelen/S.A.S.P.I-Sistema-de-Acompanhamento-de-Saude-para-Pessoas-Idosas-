import { Module } from '@nestjs/common';
import { PrescricaoService } from './prescricao.service';
import { PrescricaoController } from './prescricao.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PrescricaoController],
  providers: [PrescricaoService],
})
export class PrescricaoModule {}