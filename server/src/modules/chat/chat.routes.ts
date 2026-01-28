import express from "express";
import { Server as SocketIOServer } from "socket.io";
import { makeChatController } from "./chat.factory";
import protect from "@/shared/middlewares/protect";
import upload from "@/shared/middlewares/upload";

export const configureChatRoutes = (io: SocketIOServer) => {
  const router = express.Router();
  const chatController = makeChatController(io);

  /**
   * @swagger
   * /chats:
   *   get:
   *     summary: Get all chats
   *     description: Retrieves all chats for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of all chats.
   */
  router.get("/", protect, chatController.getAllChats);

  /**
   * @swagger
   * /chats:
   *   post:
   *     summary: Create a new chat
   *     description: Creates a new chat for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               participantIds:
   *                 type: array
   *                 items:
   *                   type: string
   *               topic:
   *                 type: string
   *     responses:
   *       201:
   *         description: Chat created successfully.
   */
  router.post("/", protect, chatController.createChat);

  /**
   * @swagger
   * /chats/user:
   *   get:
   *     summary: Get user's chats
   *     description: Retrieves all chats associated with the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of the user's chats.
   */
  router.get("/user", protect, chatController.getUserChats);

  /**
   * @swagger
   * /chats/{id}:
   *   get:
   *     summary: Get a specific chat by ID
   *     description: Retrieves details of a specific chat by its ID.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the chat to retrieve.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Chat details.
   *       404:
   *         description: Chat not found.
   */
  router.get("/:id", protect, chatController.getChat);

  /**
   * @swagger
   * /chats/{chatId}/message:
   *   post:
   *     summary: Send a message in chat
   *     description: Sends a message in a specified chat, with optional file attachment.
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the chat to send the message to.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Message sent successfully.
   */
  router.post(
    "/:chatId/message",
    protect,
    upload.single("file"),
    chatController.sendMessage
  );

  /**
   * @swagger
   * /chats/{chatId}/status:
   *   patch:
   *     summary: Update chat status
   *     description: Updates the status of a specific chat (e.g., read/unread).
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the chat to update.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Chat status updated successfully.
   *       404:
   *         description: Chat not found.
   */
  router.patch("/:chatId/status", protect, chatController.updateChatStatus);

  /**
   * @swagger
   * /chats/ai:
   *   post:
   *     summary: Chat with AI receptionist
   *     description: Send messages to the AI receptionist and get a response.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               messages:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     role: 
   *                       type: string
   *                     content:
   *                       type: string
   *     responses:
   *       200:
   *         description: AI response.
   */
  router.post("/ai", chatController.chatWithAI);

  /**
   * @swagger
   * /chats/shop/{shopId}:
   *   post:
   *     summary: Create or get shop chat
   *     description: Creates a new chat with a shop or returns existing one
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: shopId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Shop chat created/retrieved successfully.
   */
  router.post("/shop/:shopId", protect, chatController.createShopChat);

  /**
   * @swagger
   * /chats/shop/{shopId}/chats:
   *   get:
   *     summary: Get all chats for a shop
   *     description: Get all customer chats for a specific shop (vendor only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: shopId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Shop chats retrieved successfully.
   */
  router.get("/shop/:shopId/chats", protect, chatController.getShopChats);

  /**
   * @swagger
   * /chats/shop/all:
   *   get:
   *     summary: Get all shop chats (admin only)
   *     description: Get all shop chats across the platform for admin oversight
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: All shop chats retrieved successfully.
   */
  router.get("/shop/all", protect, chatController.getAllShopChats);

  /**
   * @swagger
   * /chats/{chatId}/read:
   *   patch:
   *     summary: Mark messages as read
   *     description: Mark all unread messages in a chat as read
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Messages marked as read.
   */
  router.patch("/:chatId/read", protect, chatController.markAsRead);

  /**
   * @swagger
   * /chats/unread/count:
   *   get:
   *     summary: Get unread message count
   *     description: Get total unread message count for current user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Unread count retrieved successfully.
   */
  router.get("/unread/count", protect, chatController.getUnreadCount);

  return router;
};
