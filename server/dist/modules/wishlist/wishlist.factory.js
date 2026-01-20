"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeWishlistController = void 0;
const wishlist_repository_1 = require("./wishlist.repository");
const wishlist_service_1 = require("./wishlist.service");
const wishlist_controller_1 = require("./wishlist.controller");
const makeWishlistController = () => {
    const repository = new wishlist_repository_1.WishlistRepository();
    const service = new wishlist_service_1.WishlistService(repository);
    return new wishlist_controller_1.WishlistController(service);
};
exports.makeWishlistController = makeWishlistController;
