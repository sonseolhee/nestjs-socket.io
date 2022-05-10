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
  cors: { origin: 'http://127.0.0.1:5500', credentials: true },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger(ChatGateway.name);
  private connectedPeer = [];

  @WebSocketServer()
  server: Server;

  // # new user
  @SubscribeMessage('register-new-user')
  handleNewUser(@ConnectedSocket() socket: Socket, @MessageBody() data) {
    const user = {
      username: data.username,
      socketId: socket.id,
      roomId: data.roomId,
    };
    console.log(user);

    socket.join(data.roomId);

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

    const connectPeer = this.connectedPeer.filter((peer) => {
      return peer.socketId === receiverSocketId;
    });

    if (connectPeer) {
      const authorData = {
        ...data,
        isAuthor: true,
      };
      socket.emit('direct-chat-message', authorData); // only emit to author
      this.server.to(receiverSocketId).emit('direct-chat-message', data); // only to receiver
    }
  }

  // # Room-chat
  @SubscribeMessage('room-message')
  hanldeRoomMessage(@MessageBody() data: any) {
    const { roomId } = data;
    this.server.to(roomId).emit('room-message', data);
  }

  afterInit(server: any) {
    this.logger.log('Init', server);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client Connected', client.id);
  }

  handleDisconnect(client: any) {
    this.logger.log('Client Disconnected', client.id);

    this.connectedPeer = this.connectedPeer.filter(
      (peer) => peer.socketId !== client.id,
    );

    const data = {
      disconnected: client.id,
    };

    this.server.emit('peer-disconnected', data);
  }
}
