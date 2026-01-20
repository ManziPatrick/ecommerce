"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class WishlistRepository {
    async add(userId, variantId) {
        return database_config_1.default.wishlist.create({
            data: {
                userId,
                variantId,
            },
        });
    }
    async remove(userId, variantId) {
        return database_config_1.default.wishlist.deleteMany({
            where: {
                userId,
                variantId,
            },
        });
    }
    async findByUser(userId) {
        return database_config_1.default.wishlist.findMany({
            where: { userId },
            include: {
                variant: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async findOne(userId, variantId) {
        return database_config_1.default.wishlist.findUnique({
            where: {
                userId_variantId: {
                    userId,
                    variantId,
                },
            },
        });
    }
}
exports.WishlistRepository = WishlistRepository;
