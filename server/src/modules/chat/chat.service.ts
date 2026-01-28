import { ChatRepository } from "./chat.repository";
import { Chat, ChatMessage } from "@prisma/client";
import { Server as SocketIOServer } from "socket.io";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { OpenRouter } from "@openrouter/sdk";
import prisma from "@/infra/database/database.config";

export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private io: SocketIOServer
  ) { }

  async createChat(userId: string): Promise<Chat> {
    const chat = await this.chatRepository.createChat(userId);
    this.io.to("admin").emit("chatCreated", chat);
    return chat;
  }

  // Create or get existing shop chat
  async createShopChat(userId: string, shopId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOrCreateShopChat(userId, shopId);
    
    // Notify shop owner
    if ((chat as any).shop?.ownerId) {
      this.io.to(`vendor:${(chat as any).shop.ownerId}`).emit("shop:chatCreated", chat);
    }
    
    // Notify admins
    this.io.to("admin").emit("shop:chatCreated", chat);
    
    return chat;
  }

  // Get all chats for a shop (vendor dashboard)
  async getShopChats(shopId: string): Promise<Chat[]> {
    return this.chatRepository.findChatsByShop(shopId);
  }

  // Get all shop chats (admin oversight)
  async getAllShopChats(status?: "OPEN" | "RESOLVED"): Promise<Chat[]> {
    return this.chatRepository.findAllShopChats(status);
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<number> {
    return this.chatRepository.markMessagesAsRead(chatId, userId);
  }

  // Get unread message count
  async getUnreadCount(userId: string): Promise<number> {
    return this.chatRepository.getUnreadCount(userId);
  }

  async getChat(id: string): Promise<Chat | null> {
    const chat = await this.chatRepository.findChatById(id);
    if (!chat) throw new Error("Chat not found");
    return chat;
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return this.chatRepository.findChatsByUser(userId);
  }

  async getAllChats(status?: "OPEN" | "RESOLVED"): Promise<Chat[]> {
    return this.chatRepository.findAllChats(status);
  }

  async sendMessage(
    chatId: string,
    content: string | null,
    senderId: string,
    file?: Express.Multer.File
  ): Promise<ChatMessage> {
    const chat = await this.chatRepository.findChatById(chatId);
    if (!chat) throw new Error("Chat not found");

    let type: "TEXT" | "IMAGE" | "VOICE" = "TEXT";
    let url: string | undefined;

    if (file) {
      console.log("File received:", {
        mimetype: file.mimetype,
        size: file.size,
        originalname: file.originalname,
      });

      try {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: file.mimetype.startsWith("image/")
                ? "image"
                : "video",
              folder: "chat_media",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          const bufferStream = new Readable();
          bufferStream.push(file.buffer);
          bufferStream.push(null);
          bufferStream.pipe(stream);
        });

        console.log("Cloudinary upload result:", uploadResult);
        type = file.mimetype.startsWith("image/") ? "IMAGE" : "VOICE";
        url = uploadResult.secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new Error("Failed to upload file");
      }
    }

    const message = await this.chatRepository.createMessage(
      chatId,
      senderId,
      content,
      type,
      url
    );
    
    // Emit to chat room
    this.io.to(`chat:${chatId}`).emit("newMessage", message);
    
    // If it's a shop chat, emit to shop owner and admins
    if ((message as any).chat?.shopId) {
      const shopOwnerId = (message as any).chat.shop?.ownerId;
      if (shopOwnerId && shopOwnerId !== senderId) {
        this.io.to(`vendor:${shopOwnerId}`).emit("shop:newMessage", {
          ...message,
          chatId,
          shopId: (message as any).chat.shopId
        });
      }
      
      // Notify customer if vendor sent the message
      const customerId = (message as any).chat.userId;
      if (customerId && customerId !== senderId) {
        this.io.to(`user:${customerId}`).emit("shop:newMessage", {
          ...message,
          chatId,
          shopId: (message as any).chat.shopId
        });
      }
      
      // Notify admins
      this.io.to("admin").emit("shop:newMessage", message);
    }
    
    return message;
  }

  async updateChatStatus(
    chatId: string,
    status: "OPEN" | "RESOLVED"
  ): Promise<Chat> {
    const chat = await this.chatRepository.updateChatStatus(chatId, status);
    this.io.to("admin").emit("chatStatusUpdated", chat);
    return chat;
  }

  async chatWithAI(messages: { role: string; content: string }[]): Promise<string | null> {
    try {
      const userMessage = messages[messages.length - 1].content.toLowerCase();
      console.log(`🤖 Chat request received: "${userMessage}"`);
      
      // 1. Fetch ALL necessary data for local processing
      const [products, shops, categories] = await Promise.all([
        prisma.product.findMany({
          take: 50,
          include: { variants: true, shop: true, category: true },
        }),
        prisma.shop.findMany({
          take: 20,
          select: { name: true, city: true, description: true }
        }),
        prisma.category.findMany({ select: { name: true } })
      ]);

      let response: string;

      // 2. Logic-based response generation (Deterministic "macyemacye" Bot)
      
      if (userMessage.includes("shipping") || userMessage.includes("delivery") || userMessage.includes("fast")) {
        response = "🚚 **MacyeMacye Delivery Info:** We offer free delivery in Kigali for orders over 50,000 RWF! Standard delivery usually takes 1-2 business days. For outside Kigali, rates depend on your location.";
      } else if (userMessage.includes("return") || userMessage.includes("refund")) {
        response = "🔙 **Return Policy:** You can return any unused item in its original packaging within 7 days of purchase. Contact support@macyemacye.com to start a return request.";
      } else if (userMessage.includes("shop") || userMessage.includes("vendor") || userMessage.includes("where")) {
        const shopNames = shops.slice(0, 5).map(s => `**${s.name}** (${s.city})`).join(", ");
        response = `🏬 **Our Vendors:** We partner with top verified shops across Rwanda. Some featured ones include: ${shopNames}. You can browse all of them in our "Shops" section! ✨`;
      } else if (userMessage.includes("product") || userMessage.includes("category") || userMessage.includes("have")) {
        const cats = categories.map(c => c.name).join(", ");
        const featured = products.filter(p => p.isFeatured).slice(0, 3).map(p => p.name).join(", ");
        response = `🛍️ **Our Catalog:** We carry a wide range of products in: ${cats}.\n\nRight now, people are loving: **${featured}**. Is there something specific you're looking for?`;
      } else {
        // Specific Product Check
        const foundProduct = products.find(p => userMessage.includes(p.name.toLowerCase()));
        if (foundProduct) {
          const price = foundProduct.variants[0]?.price;
          response = `✨ **Found it!** The **${foundProduct.name}** is available from **${foundProduct.shop?.name}** for **${price?.toLocaleString()} RWF**. Would you like me to find more details for you?`;
        } else if (userMessage.includes("help") || userMessage.includes("contact") || userMessage.includes("support") || userMessage.includes("human")) {
          response = "☎️ **Support:** I'm here to help, but for complex issues you can reach our human team at **support@macyemacye.com** or call us at **+250 123 456 789**. 🇷🇼";
        } else {
           response = "Muraho! ✨ I'm your MacyeMacye assistant. I can help you find **products**, tell you about our **shops**, or explain our **shipping and return policies**. What can I help you with today? 🇷🇼";
        }
      }

      console.log(`🤖 Bot response: ${response.substring(0, 50)}...`);
      return response;
      
    } catch (error) {
      console.error("Custom AI Engine Error:", error);
      return "I'm having a little trouble looking that up on our site right now. Please try again or browse our categories! 🛍️";
    }
  }
}

