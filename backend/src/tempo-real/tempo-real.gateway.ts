import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class TempoRealGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('entrar-sala-idoso')
  handleJoinRoom(
    @MessageBody() idosoId: string,
    @ConnectedSocket() client: Socket,
  ) {
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