"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_1 = require("@/shared/utils/analytics");
const revenueAnalytics = {
    Query: {
        revenueAnalytics: async (_, { params }, { prisma, req }) => {
            try {
                const { timePeriod, year, startDate, endDate } = params;
                let shopId;
                const user = req.user;
                if (user?.role === "VENDOR") {
                    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
                    if (shop)
                        shopId = shop.id;
                    else
                        return { totalRevenue: 0, changes: { revenue: 0 }, monthlyTrends: { labels: [], revenue: [], orders: [], sales: [], users: [] } };
                }
                const { currentStartDate, previousStartDate, previousEndDate, yearStart, yearEnd, } = (0, analytics_1.getDateRange)({ timePeriod, year, startDate, endDate });
                const currentOrders = await (0, analytics_1.fetchData)(prisma, "order", "orderDate", currentStartDate, endDate, yearStart, yearEnd, undefined, undefined, shopId);
                const currentOrderItems = await (0, analytics_1.fetchData)(prisma, "orderItem", "createdAt", currentStartDate, endDate, yearStart, yearEnd, undefined, { variant: true }, shopId);
                const fetchPrevious = (0, analytics_1.shouldFetchPreviousPeriod)(timePeriod);
                const previousOrders = fetchPrevious
                    ? await (0, analytics_1.fetchData)(prisma, "order", "orderDate", previousStartDate, previousEndDate, yearStart, yearEnd, undefined, undefined, shopId)
                    : [];
                const previousOrderItems = fetchPrevious
                    ? await (0, analytics_1.fetchData)(prisma, "orderItem", "createdAt", previousStartDate, previousEndDate, yearStart, yearEnd, undefined, { variant: true }, shopId)
                    : [];
                const currentMetrics = (0, analytics_1.calculateMetrics)(currentOrders, currentOrderItems, []);
                const previousMetrics = (0, analytics_1.calculateMetrics)(previousOrders, previousOrderItems, []);
                const changes = (0, analytics_1.calculateChanges)(currentMetrics, previousMetrics, fetchPrevious);
                const ordersForTrends = await (0, analytics_1.fetchData)(prisma, "order", "createdAt", yearStart, yearEnd, undefined, undefined, undefined, undefined, shopId);
                const orderItemsForTrends = await (0, analytics_1.fetchData)(prisma, "orderItem", "createdAt", yearStart, yearEnd, undefined, undefined, undefined, undefined, shopId);
                const usersForTrends = await (0, analytics_1.fetchData)(prisma, "user", "createdAt", yearStart, yearEnd, undefined, undefined, undefined, undefined, shopId);
                const monthlyTrends = (0, analytics_1.aggregateMonthlyTrends)(ordersForTrends, orderItemsForTrends, usersForTrends);
                return {
                    totalRevenue: Number(currentMetrics.totalRevenue.toFixed(2)),
                    changes: {
                        revenue: changes.revenue,
                    },
                    monthlyTrends,
                };
            }
            catch (error) {
                console.error("Error in revenueAnalytics:", error);
                throw new Error("Failed to fetch revenue analytics");
            }
        },
    },
};
exports.default = revenueAnalytics;
