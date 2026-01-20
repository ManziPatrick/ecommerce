"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
class WishlistController {
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
        this.addToWishlist = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            const { variantId } = req.body;
            if (!userId)
                throw new AppError_1.default(401, "Not authenticated");
            if (!variantId)
                throw new AppError_1.default(400, "Variant ID is required");
            const item = await this.wishlistService.addToWishlist(userId, variantId);
            (0, sendResponse_1.default)(res, 201, {
                data: { item },
                message: "Added to wishlist",
            });
        });
        this.removeFromWishlist = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            const { variantId } = req.params;
            if (!userId)
                throw new AppError_1.default(401, "Not authenticated");
            await this.wishlistService.removeFromWishlist(userId, variantId);
            (0, sendResponse_1.default)(res, 204, {
                message: "Removed from wishlist",
            });
        });
        this.getWishlist = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId)
                throw new AppError_1.default(401, "Not authenticated");
            const wishlist = await this.wishlistService.getWishlist(userId);
            (0, sendResponse_1.default)(res, 200, {
                data: { wishlist },
                message: "Wishlist retrieved",
            });
        });
    }
}
exports.WishlistController = WishlistController;
