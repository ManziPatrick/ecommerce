"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class ShopRepository {
    async findManyShops(params) {
        const { where, orderBy, skip, take } = params;
        return database_config_1.default.shop.findMany({
            where,
            orderBy: orderBy || { createdAt: "desc" },
            skip,
            take,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
        });
    }
    async countShops(params) {
        const { where = {} } = params;
        return database_config_1.default.shop.count({ where });
    }
    async findShopById(id) {
        return database_config_1.default.shop.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
        });
    }
    async findShopBySlug(slug) {
        return database_config_1.default.shop.findUnique({
            where: { slug },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async createShop(data) {
        return database_config_1.default.shop.create({
            data,
        });
    }
    async updateShop(id, data) {
        return database_config_1.default.shop.update({
            where: { id },
            data,
        });
    }
    async deleteShop(id) {
        return database_config_1.default.shop.delete({
            where: { id },
        });
    }
    async findShopByOwnerId(ownerId) {
        return database_config_1.default.shop.findFirst({
            where: { ownerId },
        });
    }
}
exports.ShopRepository = ShopRepository;
