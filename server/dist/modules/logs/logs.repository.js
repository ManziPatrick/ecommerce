"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class LogsRepository {
    constructor() {
    }
    async getLogs() {
        return database_config_1.default.log.findMany({
            take: 100,
            orderBy: { createdAt: "desc" },
        });
    }
    async getLogById(id) {
        return database_config_1.default.log.findUnique({
            where: { id },
        });
    }
    async getLogsByLevel(level) {
        return database_config_1.default.log.findMany({
            where: { level },
        });
    }
    async deleteLog(id) {
        return database_config_1.default.log.delete({
            where: { id },
        });
    }
    async clearLogs() {
        return database_config_1.default.log.deleteMany();
    }
    async createLog(data) {
        return database_config_1.default.log.create({
            data: {
                level: data.level,
                message: data.message,
                context: data.context,
            },
        });
    }
}
exports.LogsRepository = LogsRepository;
