"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const uploadToCloudinary_1 = require("@/shared/utils/uploadToCloudinary");
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
const ApiFeatures_1 = __importDefault(require("@/shared/utils/ApiFeatures"));
class ReviewService {
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async createReview(userId, productId, rating, comment, files) {
        // Check if user already reviewed
        const existingReview = await this.reviewRepository.findReviewByUserAndProduct(userId, productId);
        if (existingReview) {
            throw new AppError_1.default(400, "You have already reviewed this product");
        }
        let imageUrls = [];
        if (files && files.length > 0) {
            const uploads = await (0, uploadToCloudinary_1.uploadToCloudinary)(files);
            imageUrls = uploads.map((u) => u.url);
        }
        const review = await this.reviewRepository.createReview({
            userId,
            productId,
            rating,
            comment,
            images: imageUrls,
        });
        // Update product stats
        await this.syncProductRating(productId);
        return review;
    }
    async getProductReviews(productId, queryString) {
        const apiFeatures = new ApiFeatures_1.default(queryString)
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
    async deleteReview(reviewId, userId, userRole) {
        const review = await this.reviewRepository.findReviewById(reviewId);
        if (!review) {
            throw new AppError_1.default(404, "Review not found");
        }
        // Role check: Only owner, vendor (of the product's shop), or admin can delete
        let isVendorOfProduct = false;
        if (userRole === "VENDOR") {
            const product = await database_config_1.default.product.findUnique({
                where: { id: review.productId },
                select: { shopId: true }
            });
            const vendorShop = await database_config_1.default.shop.findFirst({ where: { ownerId: userId } });
            if (product && vendorShop && product.shopId === vendorShop.id) {
                isVendorOfProduct = true;
            }
        }
        if (review.userId !== userId && userRole !== "ADMIN" && userRole !== "SUPERADMIN" && !isVendorOfProduct) {
            throw new AppError_1.default(403, "You are not authorized to delete this review");
        }
        await this.reviewRepository.deleteReview(reviewId);
        // Update product stats
        await this.syncProductRating(review.productId);
    }
    async syncProductRating(productId) {
        const { averageRating, reviewCount } = await this.reviewRepository.getProductRatingStats(productId);
        await this.reviewRepository.updateProductRating(productId, averageRating, reviewCount);
    }
}
exports.ReviewService = ReviewService;
