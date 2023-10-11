import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
// import { UseGuards } from '@nestjs/common';

// @UseGuards(SocketSessionGuard)
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private readonly socketService: SocketService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    let userId = (client.request as any)?.session?.passport?.user?.id;
    if (!userId) {
      userId = client.handshake.query.userId as string;
    }
    this.socketService.registerOnlineUser(+userId, client.id);
    console.info(`Client connected with ID: ${client.id}`);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    await this.socketService.disconnectUser(client.id);
    console.info(`Client disconnected with ID: ${client.id}`);
  }
}
// export class SocketGateway implements OnModuleInit {
//   @WebSocketServer() server: Server;
//   onModuleInit() {
//     this.server.on('connect', (socket) => {
//       console.log(socket.id);
//       console.log('Connected');
//     });
//   }

//   @SubscribeMessage('newMessage')
//   onNewMessage(@MessageBody() body: any) {
//     console.log(body);
//     this.server.emit('onMessage', {
//       msg: 'new Message',
//       content: body,
//     });
//   }
// }
