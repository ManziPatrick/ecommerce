import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { WishlistService } from "./wishlist.service";
import AppError from "@/shared/errors/AppError";

export class WishlistController {
    constructor(private wishlistService: WishlistService) { }

    addToWishlist = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const { variantId } = req.body;
        if (!userId) throw new AppError(401, "Not authenticated");
        if (!variantId) throw new AppError(400, "Variant ID is required");

        const item = await this.wishlistService.addToWishlist(userId, variantId);
        sendResponse(res, 201, {
            data: { item },
            message: "Added to wishlist",
        });
    });

    removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const { variantId } = req.params;
        if (!userId) throw new AppError(401, "Not authenticated");

        await this.wishlistService.removeFromWishlist(userId, variantId);
        sendResponse(res, 204, {
            message: "Removed from wishlist",
        });
    });

    getWishlist = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(401, "Not authenticated");

        const wishlist = await this.wishlistService.getWishlist(userId);
        sendResponse(res, 200, {
            data: { wishlist },
            message: "Wishlist retrieved",
        });
    });
}
