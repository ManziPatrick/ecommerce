"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenBlacklisted = exports.blacklistToken = void 0;
const redis_1 = __importDefault(require("@/infra/cache/redis"));
// Blacklist token in Redis
const blacklistToken = async (token, ttl) => {
    await redis_1.default.set(`blacklist:${token}`, "blacklisted", "EX", ttl);
};
exports.blacklistToken = blacklistToken;
// Check if token is blacklisted
const isTokenBlacklisted = async (token) => {
    try {
        const result = await redis_1.default.get(`blacklist:${token}`);
        return result !== null;
    }
    catch (error) {
        console.error("Redis error:", error);
        return false;
    }
};
exports.isTokenBlacklisted = isTokenBlacklisted;
