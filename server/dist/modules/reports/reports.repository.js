"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRepository = void 0;
const client_1 = require("@prisma/client");
class ReportsRepository {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async createReport(data) {
        return this.prisma.report.create({
            data: {
                type: data.type,
                format: data.format,
                userId: data.userId,
                parameters: data.parameters,
                filePath: data.filePath,
                createdAt: new Date(),
            },
        });
    }
}
exports.ReportsRepository = ReportsRepository;
