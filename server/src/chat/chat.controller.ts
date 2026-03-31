import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history/:user1/:user2')
  async getHistory(
    @Param('user1') user1: string,
    @Param('user2') user2: string,
  ) {
    return this.chatService.getConversation(user1, user2);
  }
  
    @Get('inbox/:userId')
    async getInbox(@Param('userId') userId: string) {
    return this.chatService.getInbox(userId);
    }
}