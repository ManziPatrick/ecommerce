import { WishlistRepository } from "./wishlist.repository";
import AppError from "@/shared/errors/AppError";

export class WishlistService {
    constructor(private wishlistRepository: WishlistRepository) { }

    async addToWishlist(userId: string, variantId: string) {
        const existing = await this.wishlistRepository.findOne(userId, variantId);
        if (existing) {
            throw new AppError(400, "Item already in wishlist");
        }
        return this.wishlistRepository.add(userId, variantId);
    }

    async removeFromWishlist(userId: string, variantId: string) {
        return this.wishlistRepository.remove(userId, variantId);
    }

    async getWishlist(userId: string) {
        return this.wishlistRepository.findByUser(userId);
    }
}
