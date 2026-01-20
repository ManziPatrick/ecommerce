import {
  calculateMetrics,
  fetchData,
  getDateRange,
  shouldFetchPreviousPeriod,
  calculateChanges,
  aggregateMonthlyTrends,
} from "@/shared/utils/analytics";
import { Context } from "../resolver";

const revenueAnalytics = {
  Query: {
    revenueAnalytics: async (_: any, { params }: any, { prisma, req }: Context) => {
      try {
        const { timePeriod, year, startDate, endDate } = params;
        let shopId: string | undefined;
        const user = (req as any).user;

        if (user?.role === "VENDOR") {
          const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
          if (shop) shopId = shop.id;
          else return { totalRevenue: 0, changes: { revenue: 0 }, monthlyTrends: { labels: [], revenue: [], orders: [], sales: [], users: [] } };
        }

        const {
          currentStartDate,
          previousStartDate,
          previousEndDate,
          yearStart,
          yearEnd,
        } = getDateRange({ timePeriod, year, startDate, endDate });

        const currentOrders = await fetchData(
          prisma,
          "order",
          "orderDate",
          currentStartDate,
          endDate,
          yearStart,
          yearEnd,
          undefined,
          undefined,
          shopId
        );
        const currentOrderItems = await fetchData(
          prisma,
          "orderItem",
          "createdAt",
          currentStartDate,
          endDate,
          yearStart,
          yearEnd,
          undefined,
          { variant: true },
          shopId
        );

        const fetchPrevious = shouldFetchPreviousPeriod(timePeriod);
        const previousOrders = fetchPrevious
          ? await fetchData(
            prisma,
            "order",
            "orderDate",
            previousStartDate,
            previousEndDate,
            yearStart,
            yearEnd,
            undefined,
            undefined,
            shopId
          )
          : [];
        const previousOrderItems = fetchPrevious
          ? await fetchData(
            prisma,
            "orderItem",
            "createdAt",
            previousStartDate,
            previousEndDate,
            yearStart,
            yearEnd,
            undefined,
            { variant: true },
            shopId
          )
          : [];

        const currentMetrics = calculateMetrics(currentOrders, currentOrderItems, []);
        const previousMetrics = calculateMetrics(previousOrders, previousOrderItems, []);

        const changes = calculateChanges(currentMetrics, previousMetrics, fetchPrevious);

        const ordersForTrends = await fetchData(
          prisma,
          "order",
          "createdAt",
          yearStart,
          yearEnd,
          undefined,
          undefined,
          undefined,
          undefined,
          shopId
        );
        const orderItemsForTrends = await fetchData(
          prisma,
          "orderItem",
          "createdAt",
          yearStart,
          yearEnd,
          undefined,
          undefined,
          undefined,
          undefined,
          shopId
        );
        const usersForTrends = await fetchData(
          prisma,
          "user",
          "createdAt",
          yearStart,
          yearEnd,
          undefined,
          undefined,
          undefined,
          undefined,
          shopId
        );

        const monthlyTrends = aggregateMonthlyTrends(ordersForTrends, orderItemsForTrends, usersForTrends);

        return {
          totalRevenue: Number(currentMetrics.totalRevenue.toFixed(2)),
          changes: {
            revenue: changes.revenue,
          },
          monthlyTrends,
        };
      } catch (error) {
        console.error("Error in revenueAnalytics:", error);
        throw new Error("Failed to fetch revenue analytics");
      }
    },
  },
};

export default revenueAnalytics;