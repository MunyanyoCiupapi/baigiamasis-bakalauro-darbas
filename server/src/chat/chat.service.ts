import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(senderId: string, receiverId: string, text: string) {
    return this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        text,
      },
    });
  }

  async getConversation(userId1: string, userId2: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
  async getInbox(userId: string) {
  const messages = await this.prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, displayName: true } },
      receiver: { select: { id: true, displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const contacts = new Map();
  messages.forEach((msg) => {
    const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
    if (!contacts.has(otherUser.id)) {
      contacts.set(otherUser.id, {
        id: otherUser.id,
        displayName: otherUser.displayName,
        lastMessage: msg.text,
        lastDate: msg.createdAt,
      });
    }
  });

  return Array.from(contacts.values());
}
}