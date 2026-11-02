import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RegistroDoseService } from './registro-dose.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('registro-dose')
@UseGuards(AuthGuard)
export class RegistroDoseController {
  constructor(private readonly registroDoseService: RegistroDoseService) {}

  @Post()
  registrarDose(
    @Body() body: { prescricao_id: string; status: 'CONFIRMADA' | 'RECUSADA' | 'ATRASADA'; observacao?: string },
    @Request() req: any
  ) {
    return this.registroDoseService.registrarDose(body, req.user.id);
  }

  @Get('idoso/:idosoId')
  listarHistorico(
    @Param('idosoId') idosoId: string,
    @Request() req: any
  ) {
    return this.registroDoseService.listarHistoricoPaciente(idosoId, req.user.id);
  }
}