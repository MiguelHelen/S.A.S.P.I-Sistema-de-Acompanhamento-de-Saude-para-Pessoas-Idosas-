import { Module } from '@nestjs/common';
import { IdosoService } from './idoso.service';
import { IdosoController } from './idoso.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [IdosoController],
  providers: [IdosoService],
})
export class IdosoModule {}