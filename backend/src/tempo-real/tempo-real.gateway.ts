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
    const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
    if (!authHeader) {
      client.disconnect(true);
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await this.supabase.client.auth.getUser(token);

    if (error || !data.user) {
      client.disconnect(true);
      return;
    }
    // Salva o auth_id da sessão validada direto no cliente do socket
    client.data.user = data.user;
  }

  handleDisconnect(client: Socket) {
    // Tratamento de limpeza se necessário
  }

  @SubscribeMessage('entrar-sala-idoso')
  async handleJoinRoom(
    @MessageBody() idosoId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.user) {
      return { status: 'error', message: 'Não autorizado' };
    }

    const authId = client.data.user.id;

    // Localiza quem é o usuário interno mapeado para este token
    const usuarioInterno = await this.prisma.usuario.findUnique({
      where: { auth_id: authId }
    });

    if (!usuarioInterno) {
      return { status: 'error', message: 'Usuário não encontrado na base.' };
    }

    // Administrador entra onde quiser, equipe médica/cuidadores/familiares só com vínculo
    if (usuarioInterno.perfil !== 'ADMINISTRADOR') {
      const vinculo = await this.prisma.usuario_idoso.findFirst({
        where: { usuario_id: usuarioInterno.id, idoso_id: idosoId }
      });
      if (!vinculo) {
        return { status: 'error', message: 'Acesso negado ao prontuário deste paciente.' };
      }
    }

    client.join(`idoso-${idosoId}`);
    return { status: 'ok', sala: `idoso-${idosoId}` };
  }

  emitirNovoRegistro(idosoId: string, registro: any) {
    this.server.to(`idoso-${idosoId}`).emit('novo-registro-saude', registro);
  }

  emitirAlerta(idosoId: string, mensagem: string) {
    this.server.to(`idoso-${idosoId}`).emit('alerta-saude', { mensagem });
  }
}