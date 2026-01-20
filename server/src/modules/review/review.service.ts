import { ReviewRepository } from "./review.repository";
import AppError from "@/shared/errors/AppError";
import { uploadToCloudinary } from "@/shared/utils/uploadToCloudinary";
import prisma from "@/infra/database/database.config";
import ApiFeatures from "@/shared/utils/ApiFeatures";

export class ReviewService {
  constructor(private reviewRepository: ReviewRepository) { }

  async createReview(userId: string, productId: string, rating: number, comment?: string, files?: any[]) {
    // Check if user already reviewed
    const existingReview = await this.reviewRepository.findReviewByUserAndProduct(userId, productId);
    if (existingReview) {
      throw new AppError(400, "You have already reviewed this product");
    }

    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploads = await uploadToCloudinary(files);
      imageUrls = uploads.map((u: any) => u.url);
    }

    const review = await this.reviewRepository.createReview({
      userId,
      productId,
      rating,
      comment,
      images: imageUrls,
    } as any);

    // Update product stats
    await this.syncProductRating(productId);

    return review;
  }

  async getProductReviews(productId: string, queryString: Record<string, any>) {
    const apiFeatures = new ApiFeatures(queryString)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .build();

    const { skip, take } = apiFeatures;
    const where = { productId };

    const totalResults = await this.reviewRepository.countReviews(where);
    const totalPages = Math.ceil(totalResults / take);
    const currentPage = Math.floor(skip / take) + 1;

    const reviews = await this.reviewRepository.findReviewsByProductId(productId, {
      skip,
      take,
    });

    return {
      reviews,
      totalResults,
      totalPages,
      currentPage,
      resultsPerPage: take,
    };
  }

  async deleteReview(reviewId: string, userId: string, userRole: string) {
    const review = await this.reviewRepository.findReviewById(reviewId);
    if (!review) {
      throw new AppError(404, "Review not found");
    }

    // Role check: Only owner, vendor (of the product's shop), or admin can delete
    let isVendorOfProduct = false;
    if (userRole === "VENDOR") {
      const product = await prisma.product.findUnique({
        where: { id: review.productId },
        select: { shopId: true }
      });
      const vendorShop = await prisma.shop.findFirst({ where: { ownerId: userId } });
      if (product && vendorShop && (product as any).shopId === vendorShop.id) {
        isVendorOfProduct = true;
      }
    }

    if (review.userId !== userId && userRole !== "ADMIN" && userRole !== "SUPERADMIN" && !isVendorOfProduct) {
      throw new AppError(403, "You are not authorized to delete this review");
    }

    await this.reviewRepository.deleteReview(reviewId);

    // Update product stats
    await this.syncProductRating(review.productId);
  }

  private async syncProductRating(productId: string) {
    const { averageRating, reviewCount } = await this.reviewRepository.getProductRatingStats(productId);
    await this.reviewRepository.updateProductRating(productId, averageRating, reviewCount);
  }
}
