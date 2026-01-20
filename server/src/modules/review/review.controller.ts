import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { ReviewService } from "./review.service";
import AppError from "@/shared/errors/AppError";

export class ReviewController {
  constructor(private reviewService: ReviewService) { }

  createReview = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id;
    const { productId, rating, comment } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    if (!productId || !rating) {
      throw new AppError(400, "Product ID and rating are required");
    }

    const review = await this.reviewService.createReview(
      userId,
      productId,
      Number(rating),
      comment,
      files
    );

    sendResponse(res, 201, {
      data: { review },
      message: "Review created successfully",
    });
  });

  getProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;

    if (!productId) {
      throw new AppError(400, "Product ID is required");
    }

    const {
      reviews,
      totalResults,
      totalPages,
      currentPage,
      resultsPerPage,
    } = await this.reviewService.getProductReviews(productId, req.query);

    sendResponse(res, 200, {
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

  deleteReview = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    const { reviewId } = req.params;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    await this.reviewService.deleteReview(reviewId, userId, userRole!);

    sendResponse(res, 200, {
      message: "Review deleted successfully",
    });
  });
}
