"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class AuthRepository {
    async findUserByEmail(email) {
        return database_config_1.default.user.findUnique({
            where: { email },
        });
    }
    async findUserByEmailWithPassword(email) {
        return database_config_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                password: true,
                role: true,
                name: true,
                email: true,
                avatar: true,
            },
        });
    }
    async findUserById(id) {
        return database_config_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
            },
        });
    }
    async createUser(data) {
        return database_config_1.default.user.create({
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
            },
        });
    }
    async updateUserEmailVerification(userId, data) {
        return database_config_1.default.user.update({
            where: { id: userId },
            data,
        });
    }
    async updateUserPasswordReset(email, data) {
        return database_config_1.default.user.update({
            where: { email },
            data,
        });
    }
    async findUserByResetToken(hashedToken) {
        return database_config_1.default.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordTokenExpiresAt: { gt: new Date() },
            },
        });
    }
    async updateUserPassword(userId, password) {
        return database_config_1.default.user.update({
            where: { id: userId },
            data: {
                password,
                resetPasswordToken: null,
                resetPasswordTokenExpiresAt: null,
            },
        });
    }
}
exports.AuthRepository = AuthRepository;
