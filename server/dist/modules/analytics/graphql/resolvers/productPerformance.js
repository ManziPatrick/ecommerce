"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_1 = require("@/shared/utils/analytics");
const productPerformance = {
    Query: {
        productPerformance: async (_, { params }, { prisma, req }) => {
            const { timePeriod, year, startDate, endDate, category } = params;
            let shopId;
            const user = req.user;
            if (user?.role === "VENDOR") {
                const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
                if (shop)
                    shopId = shop.id;
                else
                    return [];
            }
            const { currentStartDate, yearStart, yearEnd } = (0, analytics_1.getDateRange)({
                timePeriod,
                year,
                startDate,
                endDate,
            });
            const orderItems = await prisma.orderItem.findMany({
                where: {
                    createdAt: {
                        ...(currentStartDate && { gte: currentStartDate }),
                        ...(endDate && { lte: new Date(endDate) }),
                        ...(yearStart && { gte: yearStart }),
                        ...(yearEnd && { lte: yearEnd }),
                    },
                    ...(shopId && { shopId }),
                    // category filter commented out; adjust if needed
                },
                include: { variant: true },
            });
            const productSales = {};
            for (const item of orderItems) {
                const productId = item.variantId;
                if (!productSales[productId]) {
                    productSales[productId] = {
                        id: productId,
                        name: item.variant.sku || "Unknown",
                        quantity: 0,
                        revenue: 0,
                    };
                }
                productSales[productId].quantity += item.quantity;
                productSales[productId].revenue +=
                    item.quantity * (item.variant.price || 0);
            }
            return Object.values(productSales).sort((a, b) => b.quantity - a.quantity);
        },
    },
};
exports.default = productPerformance;
