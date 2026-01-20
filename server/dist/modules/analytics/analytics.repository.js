"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
const client_1 = require("@prisma/client");
class AnalyticsRepository {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async getOrderYearRange() {
        const orders = await this.prisma.order.findMany({
            select: { orderDate: true },
            orderBy: { orderDate: "asc" },
        });
        const years = [
            ...new Set(orders.map((order) => order.orderDate.getFullYear())),
        ];
        return years;
    }
    async getOrdersByTimePeriod(start, end, yearStart, yearEnd) {
        return this.prisma.order.findMany({
            where: {
                orderDate: {
                    gte: start || yearStart,
                    lte: end || yearEnd,
                },
            },
            include: { user: true },
        });
    }
    async getOrderItemsByTimePeriod(start, end, yearStart, yearEnd, category) {
        return this.prisma.orderItem.findMany({
            where: {
                createdAt: {
                    gte: start || yearStart,
                    lte: end || yearEnd,
                },
                ...(category && {
                    product: {
                        category: {
                            name: category,
                        },
                    },
                }),
            },
            include: { variant: true },
        });
    }
    async getUsersByTimePeriod(start, end, yearStart, yearEnd) {
        return this.prisma.user.findMany({
            where: {
                createdAt: {
                    gte: start || yearStart,
                    lte: end || yearEnd,
                },
            },
            include: { orders: true },
        });
    }
    async getInteractionsByTimePeriod(start, end, yearStart, yearEnd) {
        return this.prisma.interaction.findMany({
            where: {
                createdAt: {
                    gte: start || yearStart,
                    lte: end || yearEnd,
                },
            },
            include: { user: true, product: true },
        });
    }
    async createInteraction(data) {
        return this.prisma.interaction.create({
            data: {
                userId: data.userId,
                sessionId: data.sessionId,
                productId: data.productId,
                type: data.type,
            },
        });
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
