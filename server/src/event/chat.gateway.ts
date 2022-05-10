import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway(80, {
  cors: { origin: 'http://127.0.0.1:5501', credentials: true },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger(ChatGateway.name);
  private connectedPeer = [];

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('register-new-user')
  handleNewUser(@ConnectedSocket() socket: Socket, @MessageBody() data) {
    console.log(this.connectedPeer);
    const user = {
      username: data.username,
      socketId: socket.id,
    };

    this.connectedPeer = [...this.connectedPeer, user];

    this.server.emit('active-peers', { connectedPeers: this.connectedPeer });
  }

  // # Group-chat
  @SubscribeMessage('group-chat-message')
  handleGroupMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    this.server.emit('group-chat-message', data);
  }

  // # Direct-chat
  @SubscribeMessage('direct-chat-message')
  handleDirectMessage(@ConnectedSocket() socket: Socket, @MessageBody() data) {
    const { receiverSocketId } = data;
    const connectPeer = this.connectedPeer.find((peer) => {
      peer.socketId === receiverSocketId;
    });
    if (connectPeer) {
      const authorData = {
        ...data,
        isAuthor: true,
      };
      socket.emit('direct-chat-message', authorData); // only emit to author
      this.server.to(receiverSocketId).emit('direct-chat-message', data); // only to receiver
    }
    // return { event: 'direct-chat-message', data };
  }

  afterInit(server: any) {
    this.logger.log('Init', server);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client Connected', client.id);
  }

  handleDisconnect(client: any) {
    this.logger.log('Client Disconnected', client.id);
  }
}
