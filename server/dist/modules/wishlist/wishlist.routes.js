"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = __importDefault(require("@/shared/middlewares/protect"));
const wishlist_factory_1 = require("./wishlist.factory");
const router = express_1.default.Router();
const wishlistController = (0, wishlist_factory_1.makeWishlistController)();
router.post("/", protect_1.default, wishlistController.addToWishlist);
router.get("/", protect_1.default, wishlistController.getWishlist);
router.delete("/:variantId", protect_1.default, wishlistController.removeFromWishlist);
exports.default = router;
