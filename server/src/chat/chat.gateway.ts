import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', 
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`🔗 Prisijungė prie chato: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Atsijungė nuo chato: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(userId);
    console.log(`Vartotojas ${userId} prisijungė prie chato kambario.`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: string; receiverId: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const savedMessage = await this.chatService.saveMessage(
        data.senderId,
        data.receiverId,
        data.text,
      );

      this.server.to(data.receiverId).emit('newMessage', savedMessage);
      
      client.emit('newMessage', savedMessage);
    } catch (error) {
      console.error('Klaida siunčiant žinutę:', error);
    }
  }
}