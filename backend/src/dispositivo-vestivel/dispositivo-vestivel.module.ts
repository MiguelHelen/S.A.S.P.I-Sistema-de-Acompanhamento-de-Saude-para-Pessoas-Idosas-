import { Module } from '@nestjs/common';
import { DispositivoVestivelService } from './dispositivo-vestivel.service';
import { DispositivoVestivelController } from './dispositivo-vestivel.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DispositivoVestivelController],
  providers: [DispositivoVestivelService],
})
export class DispositivoVestivelModule {}