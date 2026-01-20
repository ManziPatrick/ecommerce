"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_1 = require("@/shared/utils/analytics");
const orderAnalytics = {
    Query: {
        orderAnalytics: async (_, { params }, { prisma, req }) => {
            try {
                const { timePeriod, year, startDate, endDate } = params;
                let shopId;
                const user = req.user;
                if (user?.role === "VENDOR") {
                    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
                    if (shop)
                        shopId = shop.id;
                    else
                        return { totalOrders: 0, totalSales: 0, averageOrderValue: 0, changes: { orders: 0, sales: 0, averageOrderValue: 0 } };
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
                return {
                    totalOrders: currentMetrics.totalOrders,
                    totalSales: currentMetrics.totalSales,
                    averageOrderValue: Number(currentMetrics.averageOrderValue.toFixed(2)),
                    changes: {
                        orders: changes.orders,
                        sales: changes.sales,
                        averageOrderValue: changes.averageOrderValue,
                    },
                };
            }
            catch (error) {
                console.error("Error in orderAnalytics:", error);
                throw new Error("Failed to fetch order analytics");
            }
        },
    },
};
exports.default = orderAnalytics;
