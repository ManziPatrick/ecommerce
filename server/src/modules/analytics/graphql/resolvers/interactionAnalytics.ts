import { getDateRange } from "@/shared/utils/analytics";
import { Context } from "../resolver";

const interactionAnalytics = {
  Query: {
    interactionAnalytics: async (
      _: any,
      { params }: any,
      { prisma, req }: Context
    ) => {
      const { timePeriod, year, startDate, endDate } = params;
      let shopId: string | undefined;
      const user = (req as any).user;

      if (user?.role === "VENDOR") {
        const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
        if (shop) shopId = shop.id;
        else return { totalInteractions: 0, byType: { views: 0, clicks: 0, others: 0 }, mostViewedProducts: [] };
      }

      const { currentStartDate, yearStart, yearEnd } = getDateRange({
        timePeriod,
        year,
        startDate,
        endDate,
      });

      const interactions = await prisma.interaction.findMany({
        where: {
          createdAt: {
            ...(currentStartDate && { gte: currentStartDate }),
            ...(endDate && { lte: new Date(endDate) }),
            ...(yearStart && { gte: yearStart }),
            ...(yearEnd && { lte: yearEnd }),
          },
          ...(shopId && { product: { shopId } }),
        },
        include: { product: true },
      });

      const totalInteractions = interactions.length;
      const byType = {
        views: interactions.filter((i) => i.type.toLowerCase() === "view").length,
        clicks: interactions.filter((i) => i.type.toLowerCase() === "click").length,
        others: interactions.filter(
          (i) => !["view", "click"].includes(i.type.toLowerCase())
        ).length,
      };

      const productViews: {
        [productId: string]: { name: string; count: number };
      } = {};
      for (const interaction of interactions) {
        if (interaction.type.toLowerCase() === "view" && interaction.productId) {
          if (!productViews[interaction.productId]) {
            productViews[interaction.productId] = {
              name: interaction.product?.name || "Unknown",
              count: 0,
            };
          }
          productViews[interaction.productId].count += 1;
        }
      }

      const mostViewedProducts = Object.entries(productViews)
        .map(([productId, data]) => ({
          productId,
          productName: data.name,
          viewCount: data.count,
        }))
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5);

      return {
        totalInteractions,
        byType,
        mostViewedProducts,
      };
    },
  },
};

export default interactionAnalytics;