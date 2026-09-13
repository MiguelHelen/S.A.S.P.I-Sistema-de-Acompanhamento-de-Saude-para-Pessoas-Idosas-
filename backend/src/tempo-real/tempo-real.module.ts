import { Module } from '@nestjs/common';
import { TempoRealGateway } from './tempo-real.gateway';

@Module({
  providers: [TempoRealGateway],
  exports: [TempoRealGateway],
})
export class TempoRealModule {}