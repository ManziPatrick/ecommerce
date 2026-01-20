"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class ReviewRepository {
    async createReview(data) {
        return database_config_1.default.review.create({
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
    async findReviewsByProductId(productId, params = {}) {
        const { skip, take } = params;
        return database_config_1.default.review.findMany({
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
    async countReviews(where) {
        return database_config_1.default.review.count({ where });
    }
    async findReviewById(id) {
        return database_config_1.default.review.findUnique({
            where: { id },
            include: { user: true },
        });
    }
    async findReviewByUserAndProduct(userId, productId) {
        return database_config_1.default.review.findUnique({
            where: {
                productId_userId: {
                    productId,
                    userId,
                },
            },
        });
    }
    async updateReview(id, data) {
        return database_config_1.default.review.update({
            where: { id },
            data,
        });
    }
    async deleteReview(id) {
        return database_config_1.default.review.delete({
            where: { id },
        });
    }
    async getProductRatingStats(productId) {
        const stats = await database_config_1.default.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: { id: true },
        });
        return {
            averageRating: stats._avg.rating || 0,
            reviewCount: stats._count.id || 0,
        };
    }
    async updateProductRating(productId, averageRating, reviewCount) {
        return database_config_1.default.product.update({
            where: { id: productId },
            data: {
                averageRating,
                reviewCount,
            },
        });
    }
}
exports.ReviewRepository = ReviewRepository;
