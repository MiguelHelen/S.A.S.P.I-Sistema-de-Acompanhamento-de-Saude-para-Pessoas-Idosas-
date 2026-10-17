import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClinicaModule } from './clinica/clinica.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UsuarioModule } from './usuario/usuario.module';
import { IdosoModule } from './idoso/idoso.module';
import { UsuarioIdosoModule } from './usuario-idoso/usuario-idoso.module';
import { IndicadorSaudeModule } from './indicador-saude/indicador-saude.module';
import { DispositivoVestivelModule } from './dispositivo-vestivel/dispositivo-vestivel.module';
import { RegistroSaudeModule } from './registro-saude/registro-saude.module';
import { MedicamentoModule } from './medicamento/medicamento.module';
import { PrescricaoModule } from './prescricao/prescricao.module';
import { ConsultaModule } from './consulta/consulta.module';
import { AuthModule } from './auth/auth.module';
import { TempoRealModule } from './tempo-real/tempo-real.module';

@Module({
  imports: [
    PrismaModule,
    ClinicaModule,
    SupabaseModule,
    UsuarioModule,
    IdosoModule,
    UsuarioIdosoModule,
    IndicadorSaudeModule,
    DispositivoVestivelModule,
    RegistroSaudeModule,
    MedicamentoModule,
    PrescricaoModule,
    ConsultaModule,
    AuthModule,
    TempoRealModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}