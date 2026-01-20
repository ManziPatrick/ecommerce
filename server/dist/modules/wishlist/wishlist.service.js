"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
class WishlistService {
    constructor(wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }
    async addToWishlist(userId, variantId) {
        const existing = await this.wishlistRepository.findOne(userId, variantId);
        if (existing) {
            throw new AppError_1.default(400, "Item already in wishlist");
        }
        return this.wishlistRepository.add(userId, variantId);
    }
    async removeFromWishlist(userId, variantId) {
        return this.wishlistRepository.remove(userId, variantId);
    }
    async getWishlist(userId) {
        return this.wishlistRepository.findByUser(userId);
    }
}
exports.WishlistService = WishlistService;
