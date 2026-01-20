import prisma from "@/infra/database/database.config";
import { Prisma } from "@prisma/client";

export class ReviewRepository {
  async createReview(data: Prisma.ReviewUncheckedCreateInput) {
    return prisma.review.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findReviewsByProductId(productId: string, params: { skip?: number; take?: number } = {}) {
    const { skip, take } = params;
    return prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  }

  async countReviews(where: Prisma.ReviewWhereInput) {
    return prisma.review.count({ where });
  }

  async findReviewById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findReviewByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });
  }

  async updateReview(id: string, data: Prisma.ReviewUpdateInput) {
    return prisma.review.update({
      where: { id },
      data,
    });
  }

  async deleteReview(id: string) {
    return prisma.review.delete({
      where: { id },
    });
  }

  async getProductRatingStats(productId: string) {
    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { id: true },
    });
    return {
      averageRating: stats._avg.rating || 0,
      reviewCount: stats._count.id || 0,
    };
  }

  async updateProductRating(productId: string, averageRating: number, reviewCount: number) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        averageRating,
        reviewCount,
      },
    });
  }
}
