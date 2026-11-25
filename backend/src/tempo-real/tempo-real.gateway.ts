import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class TempoRealGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private supabase: SupabaseService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const authHeader =
      client.handshake.headers.authorization ||
      (client.handshake.auth as { token?: string } | undefined)?.token;

    if (!authHeader) {
      client.disconnect(true);
      return;
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      client.disconnect(true);
      return;
    }

    const { data, error } = await this.supabase.client.auth.getUser(token);

    if (error || !data.user) {
      client.disconnect(true);
      return;
    }

    client.data.user = data.user;
  }

  handleDisconnect(_client: Socket) {
    // Limpeza padrão gerenciada pelo Socket.IO
  }

  @SubscribeMessage('entrar-sala-idoso')
  async handleJoinRoom(
    @MessageBody() idosoId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.user) {
      return { status: 'error', message: 'Não autorizado' };
    }

    if (!idosoId || typeof idosoId !== 'string') {
      return { status: 'error', message: 'Identificador do paciente inválido.' };
    }

    const authId = client.data.user.id;

    const usuarioInterno = await this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });

    if (!usuarioInterno) {
      return { status: 'error', message: 'Usuário não encontrado na base.' };
    }

    if (usuarioInterno.perfil !== 'ADMINISTRADOR') {
      const vinculo = await this.prisma.usuario_idoso.findFirst({
        where: { usuario_id: usuarioInterno.id, idoso_id: idosoId },
      });

      if (!vinculo) {
        return {
          status: 'error',
          message: 'Acesso negado ao prontuário deste paciente.',
        };
      }
    }

    const sala = `idoso-${idosoId}`;
    client.join(sala);
    return { status: 'ok', sala };
  }

  emitirNovoRegistro(idosoId: string, registro: any) {
    this.server.to(`idoso-${idosoId}`).emit('novo-registro-saude', registro);
  }

  emitirAlerta(idosoId: string, mensagem: string) {
    this.server.to(`idoso-${idosoId}`).emit('alerta-saude', { mensagem });
  }
}