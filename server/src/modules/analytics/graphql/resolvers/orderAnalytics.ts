import {
  calculateMetrics,
  fetchData,
  getDateRange,
  shouldFetchPreviousPeriod,
  calculateChanges,
} from "@/shared/utils/analytics";
import { Context } from "../resolver";

const orderAnalytics = {
  Query: {
    orderAnalytics: async (_: any, { params }: any, { prisma, req }: Context) => {
      try {
        const { timePeriod, year, startDate, endDate } = params;
        let shopId: string | undefined;
        const user = (req as any).user;

        if (user?.role === "VENDOR") {
          const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
          if (shop) shopId = shop.id;
          else return { totalOrders: 0, totalSales: 0, averageOrderValue: 0, changes: { orders: 0, sales: 0, averageOrderValue: 0 } };
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
      } catch (error) {
        console.error("Error in orderAnalytics:", error);
        throw new Error("Failed to fetch order analytics");
      }
    },
  },
};

export default orderAnalytics;