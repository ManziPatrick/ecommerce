"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class ChatRepository {
    constructor() { }
    async createChat(userId) {
        return database_config_1.default.chat.create({
            data: {
                userId,
                status: "OPEN",
            },
            include: { user: true, messages: { include: { sender: true } } },
        });
    }
    async finduserChats(userId) {
        return database_config_1.default.chat.findMany({
            where: { userId },
            include: { user: true, messages: { include: { sender: true } } },
            orderBy: { updatedAt: "desc" },
        });
    }
    async findChatById(id) {
        return database_config_1.default.chat.findUnique({
            where: { id },
            include: { user: true, messages: { include: { sender: true } } },
        });
    }
    async findChatsByUser(userId) {
        return database_config_1.default.chat.findMany({
            where: { userId },
            include: { user: true, messages: { include: { sender: true } } },
            orderBy: { updatedAt: "desc" },
        });
    }
    async findAllChats(status) {
        return database_config_1.default.chat.findMany({
            where: status ? { status } : {},
            include: { messages: { include: { sender: true } } },
        });
    }
    async createMessage(chatId, senderId, content, type = "TEXT", url) {
        return database_config_1.default.chatMessage.create({
            data: {
                chatId,
                senderId,
                content,
                type,
                url,
                createdAt: new Date(),
            },
            include: { sender: true },
        });
    }
    async updateChatStatus(chatId, status) {
        return database_config_1.default.chat.update({
            where: { id: chatId },
            data: { status },
            include: { user: true, messages: { include: { sender: true } } },
        });
    }
}
exports.ChatRepository = ChatRepository;
