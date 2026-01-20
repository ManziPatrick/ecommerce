"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const analytics_1 = require("@/shared/utils/analytics");
const userAnalytics = {
    Query: {
        userAnalytics: async (_, { params }, { prisma, req }) => {
            try {
                const { timePeriod, year, startDate, endDate } = params;
                let shopId;
                const user = req.user;
                if (user?.role === "VENDOR") {
                    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
                    if (shop)
                        shopId = shop.id;
                    else
                        return { totalUsers: 0, totalRevenue: 0, retentionRate: 0, lifetimeValue: 0, repeatPurchaseRate: 0, engagementScore: 0, topUsers: [], interactionTrends: { labels: [], views: [], clicks: [], others: [] }, changes: { users: 0 } };
                }
                const { currentStartDate, previousStartDate, previousEndDate, yearStart, yearEnd, } = (0, analytics_1.getDateRange)({ timePeriod, year, startDate, endDate });
                const users = await (0, analytics_1.fetchData)(prisma, "user", "createdAt", currentStartDate, endDate, yearStart, yearEnd, client_1.ROLE.USER, { orders: true }, shopId);
                const interactions = await (0, analytics_1.fetchData)(prisma, "interaction", "createdAt", currentStartDate, endDate, yearStart, yearEnd, undefined, undefined, shopId);
                const fetchPrevious = (0, analytics_1.shouldFetchPreviousPeriod)(timePeriod);
                const previousUsers = fetchPrevious
                    ? await (0, analytics_1.fetchData)(prisma, "user", "createdAt", previousStartDate, previousEndDate, yearStart, yearEnd, client_1.ROLE.USER, { orders: true }, shopId)
                    : [];
                const { totalCustomers: totalUsers, totalRevenue, lifetimeValue, repeatPurchaseRate, } = (0, analytics_1.calculateCustomerMetrics)(users);
                const previousMetrics = fetchPrevious
                    ? (0, analytics_1.calculateCustomerMetrics)(previousUsers)
                    : { totalCustomers: 0 };
                const retentionRate = fetchPrevious
                    ? (0, analytics_1.calculateRetentionRate)(users, previousUsers)
                    : 0;
                const { scores: engagementScores, averageScore: engagementScore } = (0, analytics_1.calculateEngagementScores)(interactions);
                const topUsers = (0, analytics_1.generateTopCustomers)(users, engagementScores);
                const interactionTrends = (0, analytics_1.aggregateInteractionTrends)(interactions);
                const changes = (0, analytics_1.calculateChanges)({ totalUsers }, { totalUsers: previousMetrics.totalCustomers }, fetchPrevious);
                return {
                    totalUsers,
                    totalRevenue: Number(totalRevenue.toFixed(2)),
                    retentionRate: Number(retentionRate.toFixed(2)),
                    lifetimeValue: Number(lifetimeValue.toFixed(2)),
                    repeatPurchaseRate: Number(repeatPurchaseRate.toFixed(2)),
                    engagementScore: Number(engagementScore.toFixed(2)),
                    topUsers,
                    interactionTrends,
                    changes: {
                        users: Number(changes.users?.toFixed(2)) || 0,
                    },
                };
            }
            catch (error) {
                console.error("Error in userAnalytics:", error);
                throw new Error("Failed to fetch user analytics");
            }
        },
    },
};
exports.default = userAnalytics;
