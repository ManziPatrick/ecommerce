"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
class ChatService {
    constructor(chatRepository, io) {
        this.chatRepository = chatRepository;
        this.io = io;
    }
    async createChat(userId) {
        const chat = await this.chatRepository.createChat(userId);
        this.io.to("admin").emit("chatCreated", chat);
        return chat;
    }
    async getChat(id) {
        const chat = await this.chatRepository.findChatById(id);
        if (!chat)
            throw new Error("Chat not found");
        return chat;
    }
    async getUserChats(userId) {
        return this.chatRepository.findChatsByUser(userId);
    }
    async getAllChats(status) {
        return this.chatRepository.findAllChats(status);
    }
    async sendMessage(chatId, content, senderId, file) {
        const chat = await this.chatRepository.findChatById(chatId);
        if (!chat)
            throw new Error("Chat not found");
        let type = "TEXT";
        let url;
        if (file) {
            console.log("File received:", {
                mimetype: file.mimetype,
                size: file.size,
                originalname: file.originalname,
            });
            try {
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary_1.v2.uploader.upload_stream({
                        resource_type: file.mimetype.startsWith("image/")
                            ? "image"
                            : "video",
                        folder: "chat_media",
                    }, (error, result) => {
                        if (error)
                            reject(error);
                        else
                            resolve(result);
                    });
                    const bufferStream = new stream_1.Readable();
                    bufferStream.push(file.buffer);
                    bufferStream.push(null);
                    bufferStream.pipe(stream);
                });
                console.log("Cloudinary upload result:", uploadResult);
                type = file.mimetype.startsWith("image/") ? "IMAGE" : "VOICE";
                url = uploadResult.secure_url;
            }
            catch (error) {
                console.error("Cloudinary upload failed:", error);
                throw new Error("Failed to upload file");
            }
        }
        const message = await this.chatRepository.createMessage(chatId, senderId, content, type, url);
        this.io.to(`chat:${chatId}`).emit("newMessage", message);
        return message;
    }
    async updateChatStatus(chatId, status) {
        const chat = await this.chatRepository.updateChatStatus(chatId, status);
        this.io.to("admin").emit("chatStatusUpdated", chat);
        return chat;
    }
}
exports.ChatService = ChatService;
