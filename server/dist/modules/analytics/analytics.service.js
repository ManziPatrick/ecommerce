"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class AnalyticsService {
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }
    async createInteraction(data) {
        return this.analyticsRepository.createInteraction({
            userId: data.userId,
            sessionId: data.sessionId,
            productId: data.productId,
            type: data.type,
        });
    }
    async getAnalyticsOverview(query) {
        const { startDate, endDate } = this.getDateRange(query);
        // Fetch orders within the date range
        const orders = await database_config_1.default.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: { orderItems: true },
        });
        const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
        const totalOrders = orders.length;
        const totalSales = orders.reduce((sum, order) => sum + order.orderItems.length, 0);
        const totalUsers = new Set(orders.map((order) => order.userId)).size;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        // Calculate changes (example: compare to previous period)
        const prevPeriod = this.getPreviousPeriod(query);
        const prevOrders = await database_config_1.default.order.findMany({
            where: {
                createdAt: {
                    gte: prevPeriod.startDate,
                    lte: prevPeriod.endDate,
                },
            },
            include: { orderItems: true },
        });
        const prevTotalRevenue = prevOrders.reduce((sum, order) => sum + order.amount, 0);
        const prevTotalOrders = prevOrders.length;
        const prevTotalSales = prevOrders.reduce((sum, order) => sum + order.orderItems.length, 0);
        const prevTotalUsers = new Set(prevOrders.map((order) => order.userId))
            .size;
        const prevAverageOrderValue = prevTotalOrders > 0 ? prevTotalRevenue / prevTotalOrders : 0;
        // Monthly trends (example: group by month)
        const monthlyTrends = await this.getMonthlyTrends(startDate, endDate);
        return {
            totalRevenue,
            totalOrders,
            totalSales,
            totalUsers,
            averageOrderValue,
            changes: {
                revenue: prevTotalRevenue > 0
                    ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
                    : null,
                orders: prevTotalOrders > 0
                    ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100
                    : null,
                sales: prevTotalSales > 0
                    ? ((totalSales - prevTotalSales) / prevTotalSales) * 100
                    : null,
                users: prevTotalUsers > 0
                    ? ((totalUsers - prevTotalUsers) / prevTotalUsers) * 100
                    : null,
                averageOrderValue: prevAverageOrderValue > 0
                    ? ((averageOrderValue - prevAverageOrderValue) /
                        prevAverageOrderValue) *
                        100
                    : null,
            },
            monthlyTrends,
        };
    }
    async getProductPerformance(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const orderItems = await database_config_1.default.orderItem.findMany({
            where: {
                order: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            },
            include: { variant: true },
        });
        const productMap = new Map();
        for (const item of orderItems) {
            const productId = item.variantId;
            const existing = productMap.get(productId) || {
                id: productId,
                name: item.variant.sku,
                quantity: 0,
                revenue: 0,
            };
            existing.quantity += item.quantity;
            existing.revenue += item.quantity * item.price;
            productMap.set(productId, existing);
        }
        return Array.from(productMap.values());
    }
    async getUserAnalytics(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const orders = await database_config_1.default.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: { user: true, orderItems: true },
        });
        const totalUsers = new Set(orders.map((order) => order.userId)).size;
        const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
        const uniqueUsers = new Set(orders.map((order) => order.userId));
        const repeatUsers = new Set(orders
            .filter((order) => orders.filter((o) => o.userId === order.userId).length > 1)
            .map((order) => order.userId));
        const retentionRate = uniqueUsers.size > 0 ? (repeatUsers.size / uniqueUsers.size) * 100 : 0;
        const lifetimeValue = uniqueUsers.size > 0 ? totalRevenue / uniqueUsers.size : 0;
        const repeatPurchaseRate = uniqueUsers.size > 0 ? (repeatUsers.size / uniqueUsers.size) * 100 : 0;
        // Engagement score (example: based on interactions)
        const interactions = await database_config_1.default.interaction.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        const engagementScore = interactions.length / (uniqueUsers.size || 1);
        // Changes
        const prevPeriod = this.getPreviousPeriod(query);
        const prevOrders = await database_config_1.default.order.findMany({
            where: {
                createdAt: {
                    gte: prevPeriod.startDate,
                    lte: prevPeriod.endDate,
                },
            },
        });
        const prevTotalUsers = new Set(prevOrders.map((order) => order.userId))
            .size;
        const usersChange = prevTotalUsers > 0
            ? ((totalUsers - prevTotalUsers) / prevTotalUsers) * 100
            : null;
        // Top users
        const userOrders = orders.reduce((map, order) => {
            const userId = order.userId;
            const existing = map.get(userId) || {
                id: userId,
                name: order.user.name,
                email: order.user.email,
                orderCount: 0,
                totalSpent: 0,
                engagementScore: 0,
            };
            existing.orderCount += 1;
            existing.totalSpent += order.amount;
            existing.engagementScore += interactions.filter((i) => i.userId === userId).length;
            map.set(userId, existing);
            return map;
        }, new Map());
        const topUsers = Array.from(userOrders.values())
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);
        // Interaction trends
        const interactionTrends = await this.getInteractionTrends(startDate, endDate);
        return {
            totalUsers,
            totalRevenue,
            retentionRate,
            lifetimeValue,
            repeatPurchaseRate,
            engagementScore,
            changes: { users: usersChange },
            topUsers,
            interactionTrends,
        };
    }
    async getYearRange() {
        const orders = await database_config_1.default.order.aggregate({
            _min: { createdAt: true },
            _max: { createdAt: true },
        });
        const minYear = orders._min.createdAt?.getFullYear() || new Date().getFullYear();
        const maxYear = orders._max.createdAt?.getFullYear() || new Date().getFullYear();
        return { minYear, maxYear };
    }
    getDateRange(query) {
        const now = new Date();
        let startDate;
        let endDate = now;
        switch (query.timePeriod) {
            case "last7days":
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case "lastMonth":
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case "lastYear":
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            case "allTime":
                startDate = new Date(0);
                break;
            case "custom":
                if (!query.startDate || !query.endDate) {
                    throw new Error("Custom range requires startDate and endDate");
                }
                startDate = query.startDate;
                endDate = query.endDate;
                break;
            default:
                throw new Error("Invalid timePeriod");
        }
        return { startDate, endDate };
    }
    getPreviousPeriod(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const duration = endDate.getTime() - startDate.getTime();
        return {
            startDate: new Date(startDate.getTime() - duration),
            endDate: new Date(startDate.getTime() - 1),
        };
    }
    async getMonthlyTrends(startDate, endDate) {
        const months = {
            labels: [],
            revenue: [],
            orders: [],
            sales: [],
            users: [],
        };
        let current = new Date(startDate);
        while (current <= endDate) {
            const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
            const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
            const orders = await database_config_1.default.order.findMany({
                where: {
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd,
                    },
                },
                include: { orderItems: true },
            });
            months.labels.push(`${monthStart.getFullYear()}-${monthStart.getMonth() + 1}`);
            months.revenue.push(orders.reduce((sum, order) => sum + order.amount, 0));
            months.orders.push(orders.length);
            months.sales.push(orders.reduce((sum, order) => sum + order.orderItems.length, 0));
            months.users.push(new Set(orders.map((order) => order.userId)).size);
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }
        return months;
    }
    async getInteractionTrends(startDate, endDate) {
        const trends = {
            labels: [],
            views: [],
            clicks: [],
            others: [],
        };
        let current = new Date(startDate);
        while (current <= endDate) {
            const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
            const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
            const interactions = await database_config_1.default.interaction.findMany({
                where: {
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd,
                    },
                },
            });
            trends.labels.push(`${monthStart.getFullYear()}-${monthStart.getMonth() + 1}`);
            trends.views.push(interactions.filter((i) => i.type === "view").length);
            trends.clicks.push(interactions.filter((i) => i.type === "click").length);
            trends.others.push(interactions.filter((i) => i.type === "other").length);
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }
        return trends;
    }
}
exports.AnalyticsService = AnalyticsService;
