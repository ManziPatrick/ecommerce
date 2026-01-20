"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
class ReviewController {
    constructor(reviewService) {
        this.reviewService = reviewService;
        this.createReview = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            const { productId, rating, comment } = req.body;
            const files = req.files;
            if (!userId) {
                throw new AppError_1.default(401, "Unauthorized");
            }
            if (!productId || !rating) {
                throw new AppError_1.default(400, "Product ID and rating are required");
            }
            const review = await this.reviewService.createReview(userId, productId, Number(rating), comment, files);
            (0, sendResponse_1.default)(res, 201, {
                data: { review },
                message: "Review created successfully",
            });
        });
        this.getProductReviews = (0, asyncHandler_1.default)(async (req, res) => {
            const { productId } = req.params;
            if (!productId) {
                throw new AppError_1.default(400, "Product ID is required");
            }
            const { reviews, totalResults, totalPages, currentPage, resultsPerPage, } = await this.reviewService.getProductReviews(productId, req.query);
            (0, sendResponse_1.default)(res, 200, {
                data: {
                    reviews,
                    totalResults,
                    totalPages,
                    currentPage,
                    resultsPerPage,
                },
                message: "Reviews retrieved successfully",
            });
        });
        this.deleteReview = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            const userRole = req.user?.role;
            const { reviewId } = req.params;
            if (!userId) {
                throw new AppError_1.default(401, "Unauthorized");
            }
            await this.reviewService.deleteReview(reviewId, userId, userRole);
            (0, sendResponse_1.default)(res, 200, {
                message: "Review deleted successfully",
            });
        });
    }
}
exports.ReviewController = ReviewController;
