import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { IsIn, IsNotEmpty, IsString, IsUUID, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";

export class SsoCallbackDto {
  @IsString({ message: "O access_token deve ser uma string." })
  @IsNotEmpty({ message: "O access_token é obrigatório." })
  access_token: string;

  @IsString({ message: "O provedor deve ser uma string." })
  @IsIn(["GOOGLE", "MICROSOFT"], {
    message: "O provedor deve ser GOOGLE ou MICROSOFT.",
  })
  provedor: "GOOGLE" | "MICROSOFT";
}

export class CriarAcessoIdosoDto {
  @IsUUID("4", { message: "idoso_id deve ser um UUID válido." })
  idoso_id: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres." })
  senha: string;
}

export class ReenviarConviteDto {
  @IsUUID("4", { message: "usuario_id deve ser um UUID válido." })
  usuario_id: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() body: { email: string; senha: string }) {
    return this.authService.login(body.email, body.senha);
  }

  @Post("sso-callback")
  ssoCallback(@Body() body: SsoCallbackDto) {
    return this.authService.ssoCallback(body.access_token, body.provedor);
  }

  @Post("convidar")
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
    @Request() req: any,
  ) {
    return this.authService.convidarUtilizador(
      body.email,
      body.nome,
      body.perfil,
      body.clinica_id,
      body.cpf,
      body.telefone,
      req.user.id,
    );
  }

  @Post("reenviar-convite")
  @UseGuards(AuthGuard)
  reenviarConvite(@Body() body: ReenviarConviteDto, @Request() req: any) {
    return this.authService.reenviarConvite(body.usuario_id, req.user.id);
  }

  @Post("acesso-idoso")
  @UseGuards(AuthGuard)
  criarAcessoIdoso(@Body() body: CriarAcessoIdosoDto, @Request() req: any) {
    return this.authService.criarAcessoIdoso(
      body.idoso_id,
      body.email,
      body.senha,
      undefined,
      req.user.id,
    );
  }
}