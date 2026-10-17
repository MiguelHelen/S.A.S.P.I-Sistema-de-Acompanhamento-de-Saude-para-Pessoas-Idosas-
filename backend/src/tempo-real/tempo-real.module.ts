import { Module } from '@nestjs/common';
import { TempoRealGateway } from './tempo-real.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [PrismaModule, SupabaseModule],
  providers: [TempoRealGateway],
  exports: [TempoRealGateway],
})
export class TempoRealModule {}