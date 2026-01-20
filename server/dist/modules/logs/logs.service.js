"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsService = void 0;
class LogsService {
    constructor(logsRepository) {
        this.logsRepository = logsRepository;
    }
    async getLogs() {
        return this.logsRepository.getLogs();
    }
    async getLogById(id) {
        return this.logsRepository.getLogById(id);
    }
    async getLogByLevel(level) {
        return this.logsRepository.getLogsByLevel(level);
    }
    async deleteLog(id) {
        return this.logsRepository.deleteLog(id);
    }
    async clearLogs() {
        return this.logsRepository.clearLogs();
    }
    async log(entry) {
        console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.context || "");
        await this.logsRepository.createLog({
            level: entry.level,
            message: entry.message,
            context: entry.context,
        });
    }
    async info(message, context) {
        await this.log({ level: "info", message, context });
    }
    async error(message, context) {
        await this.log({ level: "error", message, context });
    }
    async warn(message, context) {
        await this.log({ level: "warn", message, context });
    }
    async debug(message, context) {
        await this.log({ level: "debug", message, context });
    }
}
exports.LogsService = LogsService;
