import express from "express";
import protect from "@/shared/middlewares/protect";
import { makeWishlistController } from "./wishlist.factory";

const router = express.Router();
const wishlistController = makeWishlistController();

router.post("/", protect, wishlistController.addToWishlist);
router.get("/", protect, wishlistController.getWishlist);
router.delete("/:variantId", protect, wishlistController.removeFromWishlist);

export default router;
