import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { ChatService } from "./chat.service";
import { makeLogsService } from "../logs/logs.factory";

export class ChatController {
  private logsService = makeLogsService();
  constructor(private chatService: ChatService) { }

  getChat = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user!;

    const chat = await this.chatService.getChat(id);

    sendResponse(res, 200, {
      data: { chat },
      message: "Chat fetched successfully",
    });

    this.logsService.info("Chat fetched", {
      userId: user.id,
      chatId: id,
    });
  });

  getUserChats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not found");
    }

    const userId = req.user.id;
    console.log("userId => ", userId);
    const chats = await this.chatService.getUserChats(userId);
    console.log("chats => ", chats);

    sendResponse(res, 200, {
      data: { chats },
      message: "Chats fetched successfully",
    });

    this.logsService.info("Chats fetched by user", {
      userId,
      targetUserId: userId,
    });
  });

  getAllChats = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const { status } = req.query;

    const chats = await this.chatService.getAllChats(
      status as "OPEN" | "RESOLVED"
    );

    sendResponse(res, 200, {
      data: { chats },
      message: "All chats fetched successfully",
    });

    this.logsService.info("All chats fetched", {
      userId: user.id,
    });
  });

  createChat = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not found");
    }
    const userId = req.user.id;

    const newChat = await this.chatService.createChat(userId);

    sendResponse(res, 201, {
      data: { chat: newChat },
      message: "Chat created successfully",
    });

    this.logsService.info("Chat created", {
      userId,
    });
  });

  // Create or get shop chat
  createShopChat = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not found");
    }
    const userId = req.user.id;
    const { shopId } = req.params;

    const chat = await this.chatService.createShopChat(userId, shopId);

    sendResponse(res, 200, {
      data: { chat },
      message: "Shop chat created successfully",
    });

    this.logsService.info("Shop chat created", {
      userId,
      shopId,
    });
  });

  // Get chats for a shop (vendor only)
  getShopChats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not found");
    }
    const { shopId } = req.params;

    const chats = await this.chatService.getShopChats(shopId);

    sendResponse(res, 200, {
      data: { chats },
      message: "Shop chats fetched successfully",
    });

    this.logsService.info("Shop chats fetched", {
      userId: req.user.id,
      shopId,
    });
  });

  // Get all shop chats (admin only)
  getAllShopChats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not found");
    }
    const { status } = req.query;

    const chats = await this.chatService.getAllShopChats(
      status as "OPEN" | "RESOLVED"
    );

    sendResponse(res, 200, {
      data: { chats },
      message: "All shop chats fetched successfully",
    });

    this.logsService.info("All shop chats fetched", {
      userId: req.user.id,
    });
  });

  // Mark messages as read
  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not found");
    }
    const { chatId } = req.params;
    const userId = req.user.id;

    const count = await this.chatService.markMessagesAsRead(chatId, userId);

    sendResponse(res, 200, {
      data: { markedCount: count },
      message: "Messages marked as read",
    });
  });

  // Get unread message count
  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not found");
    }
    const userId = req.user.id;

    const count = await this.chatService.getUnreadCount(userId);

    sendResponse(res, 200, {
      data: { unreadCount: count },
      message: "Unread count fetched successfully",
    });
  });

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, content } = req.body;
    const user = req.user!;
    const file = req.file;
    console.log("file => ", file);

    const message = await this.chatService.sendMessage(
      chatId,
      content || null,
      user.id,
      file
    );

    sendResponse(res, 200, {
      data: { message },
      message: "Message sent successfully",
    });

    this.logsService.info("Message sent", {
      userId: user.id,
      chatId,
      type: message.type,
    });
  });

  updateChatStatus = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { status } = req.body;
    const user = req.user!;

    const updatedChat = await this.chatService.updateChatStatus(chatId, status);

    sendResponse(res, 200, {
      data: { chat: updatedChat },
      message: "Chat status updated successfully",
    });

    this.logsService.info("Chat status updated", {
      userId: user.id,
      chatId,
      status,
    });
  });

  chatWithAI = asyncHandler(async (req: Request, res: Response) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format");
    }

    const response = await this.chatService.chatWithAI(messages);

    sendResponse(res, 200, {
      data: { aiResponse: response },
      message: "AI response generated successfully",
    });
  });
}
