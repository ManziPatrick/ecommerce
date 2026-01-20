import { WishlistRepository } from "./wishlist.repository";
import { WishlistService } from "./wishlist.service";
import { WishlistController } from "./wishlist.controller";

export const makeWishlistController = () => {
    const repository = new WishlistRepository();
    const service = new WishlistService(repository);
    return new WishlistController(service);
};
