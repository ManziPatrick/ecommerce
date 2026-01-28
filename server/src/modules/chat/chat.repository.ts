import prisma from "@/infra/database/database.config";
import { Chat, ChatMessage } from "@prisma/client";

export class ChatRepository {
  constructor() {}

  async createChat(userId: string, shopId?: string): Promise<any> {
    return prisma.chat.create({
      data: {
        userId,
        shopId,
        status: "OPEN",
      },
      include: { 
        user: true, 
        shop: { include: { owner: true } },
        messages: { include: { sender: true }, orderBy: { createdAt: 'desc' }, take: 50 } 
      },
    });
  }

  // Find or create a chat between user and shop
  async findOrCreateShopChat(userId: string, shopId: string): Promise<any> {
    let chat: any = await prisma.chat.findFirst({
      where: { userId, shopId, status: "OPEN" },
      include: { 
        user: true, 
        shop: { include: { owner: true } },
        messages: { include: { sender: true }, orderBy: { createdAt: 'desc' }, take: 50 } 
      },
    });

    if (!chat) {
      chat = await this.createChat(userId, shopId);
    }

    return chat;
  }

  async finduserChats(userId: string): Promise<any[]> {
    return prisma.chat.findMany({
      where: {
        OR: [
          { userId },
          { shop: { ownerId: userId } }
        ]
      },
      include: { 
        user: true, 
        shop: { include: { owner: true } },
        messages: { include: { sender: true }, orderBy: { createdAt: 'desc' }, take: 1 } 
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findChatById(id: string): Promise<any | null> {
    return prisma.chat.findUnique({
      where: { id },
      include: { 
        user: true, 
        shop: { include: { owner: true } },
        messages: { include: { sender: true }, orderBy: { createdAt: 'asc' } } 
      },
    });
  }

  async findChatsByUser(userId: string): Promise<any[]> {
    return prisma.chat.findMany({
      where: {
        OR: [
          { userId },
          { shop: { ownerId: userId } }
        ]
      },
      include: { 
        user: true, 
        shop: true,
        messages: { include: { sender: true }, orderBy: { createdAt: 'desc' }, take: 1 } 
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  // Get all chats for a specific shop (for vendor dashboard)
  async findChatsByShop(shopId: string): Promise<any[]> {
    return prisma.chat.findMany({
      where: { shopId },
      include: { 
        user: true, 
        shop: true,
        messages: { 
          include: { sender: true }, 
          orderBy: { createdAt: 'desc' }, 
          take: 1 
        } 
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  // Get all shop chats (for admin oversight)
  async findAllShopChats(status?: "OPEN" | "RESOLVED"): Promise<any[]> {
    return prisma.chat.findMany({
      where: { 
        shopId: { not: null },
        ...(status && { status })
      },
      include: { 
        user: true, 
        shop: { include: { owner: true } },
        messages: { include: { sender: true }, orderBy: { createdAt: 'desc' }, take: 1 } 
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findAllChats(status?: "OPEN" | "RESOLVED"): Promise<any[]> {
    return prisma.chat.findMany({
      where: status ? { status } : {},
      include: { 
        user: true,
        shop: true,
        messages: { include: { sender: true }, orderBy: { createdAt: 'desc' }, take: 1 } 
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async createMessage(
    chatId: string,
    senderId: string,
    content: string | null,
    type: "TEXT" | "IMAGE" | "VOICE" = "TEXT",
    url?: string
  ): Promise<ChatMessage> {
    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    return prisma.chatMessage.create({
      data: {
        chatId,
        senderId,
        content,
        type,
        url,
        isRead: false,
        createdAt: new Date(),
      },
      include: { sender: true, chat: { include: { shop: true, user: true } } },
    });
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<number> {
    const result = await prisma.chatMessage.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    return result.count;
  }

  // Get unread message count for a user
  async getUnreadCount(userId: string): Promise<number> {
    const chats = await prisma.chat.findMany({
      where: { 
        OR: [
          { userId },
          { shop: { ownerId: userId } }
        ]
      },
      select: { id: true }
    });

    const chatIds = chats.map(c => c.id);

    return prisma.chatMessage.count({
      where: {
        chatId: { in: chatIds },
        senderId: { not: userId },
        isRead: false
      }
    });
  }

  async updateChatStatus(
    chatId: string,
    status: "OPEN" | "RESOLVED"
  ): Promise<Chat> {
    return prisma.chat.update({
      where: { id: chatId },
      data: { status },
      include: { 
        user: true, 
        shop: true,
        messages: { include: { sender: true } } 
      },
    });
  }
}
