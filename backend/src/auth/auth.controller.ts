import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; senha: string }) {
    return this.authService.login(body.email, body.senha);
  }

  @Post('sso-callback')
  ssoCallback(
    @Body() body: { access_token: string; provedor: 'GOOGLE' | 'MICROSOFT' },
  ) {
    return this.authService.ssoCallback(body.access_token, body.provedor);
  }

  @Post('convidar')
  @UseGuards(AuthGuard)
  convidar(
    @Body()
    body: {
      email: string;
      nome: string;
      perfil: any;
      clinica_id: string;
      cpf?: string;
      telefone?: string;
    },
  ) {
    return this.authService.convidarUtilizador(
      body.email,
      body.nome,
      body.perfil,
      body.clinica_id,
      body.cpf,
      body.telefone,
    );
  }
}