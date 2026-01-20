"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const slugify_1 = __importDefault(require("@/shared/utils/slugify"));
const ApiFeatures_1 = __importDefault(require("@/shared/utils/ApiFeatures"));
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class ShopService {
    constructor(shopRepository) {
        this.shopRepository = shopRepository;
    }
    async getAllShops(queryString) {
        const apiFeatures = new ApiFeatures_1.default(queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            .build();
        const { where, orderBy, skip, take } = apiFeatures;
        const totalResults = await this.shopRepository.countShops({ where });
        const totalPages = Math.ceil(totalResults / take);
        const currentPage = Math.floor(skip / take) + 1;
        const shops = await this.shopRepository.findManyShops({
            where,
            orderBy,
            skip,
            take,
        });
        return {
            shops,
            totalResults,
            totalPages,
            currentPage,
            resultsPerPage: take,
        };
    }
    async getShop(shopId) {
        const shop = await this.shopRepository.findShopById(shopId);
        if (!shop) {
            throw new AppError_1.default(404, "Shop not found");
        }
        return shop;
    }
    async getShopBySlug(slug) {
        const shop = await this.shopRepository.findShopBySlug(slug);
        if (!shop) {
            throw new AppError_1.default(404, "Shop not found");
        }
        return shop;
    }
    async getShopByOwnerId(ownerId) {
        const shop = await this.shopRepository.findShopByOwnerId(ownerId);
        if (!shop) {
            throw new AppError_1.default(404, "Shop not found");
        }
        return shop;
    }
    async createShop(data) {
        const slug = (0, slugify_1.default)(data.name);
        const existingShop = await database_config_1.default.shop.findUnique({ where: { slug } });
        if (existingShop) {
            throw new AppError_1.default(400, "Shop with this name already exists");
        }
        // Check if user already has a shop (one shop per vendor for now)
        const userShop = await this.shopRepository.findShopByOwnerId(data.ownerId);
        if (userShop) {
            throw new AppError_1.default(400, "User already owns a shop");
        }
        // Ensure user exists and has VENDOR role (or upgrade them)
        const user = await database_config_1.default.user.findUnique({ where: { id: data.ownerId } });
        if (!user) {
            throw new AppError_1.default(404, "User not found");
        }
        const shop = await this.shopRepository.createShop({
            name: data.name,
            slug,
            description: data.description,
            logo: data.logo,
            email: data.email,
            phone: data.phone,
            country: data.country,
            city: data.city,
            village: data.village,
            street: data.street,
            placeName: data.placeName,
            latitude: data.latitude,
            longitude: data.longitude,
            ownerId: data.ownerId,
        });
        // Upgrade user to VENDOR if they are a normal USER
        if (user.role === "USER") {
            await database_config_1.default.user.update({
                where: { id: data.ownerId },
                data: { role: "VENDOR" },
            });
        }
        return { shop };
    }
    async updateShop(shopId, data) {
        const shop = await this.shopRepository.findShopById(shopId);
        if (!shop) {
            throw new AppError_1.default(404, "Shop not found");
        }
        const slug = data.name ? (0, slugify_1.default)(data.name) : undefined;
        if (slug && slug !== shop.slug) {
            const existingShop = await database_config_1.default.shop.findUnique({ where: { slug } });
            if (existingShop) {
                throw new AppError_1.default(400, "Shop with this name already exists");
            }
        }
        const updatedShop = await this.shopRepository.updateShop(shopId, {
            name: data.name,
            slug,
            description: data.description,
            logo: data.logo,
            email: data.email,
            phone: data.phone,
            country: data.country,
            city: data.city,
            village: data.village,
            street: data.street,
            placeName: data.placeName,
            latitude: data.latitude,
            longitude: data.longitude,
        });
        return { shop: updatedShop };
    }
    async deleteShop(shopId) {
        const shop = await this.shopRepository.findShopById(shopId);
        if (!shop) {
            throw new AppError_1.default(404, "Shop not found");
        }
        await this.shopRepository.deleteShop(shopId);
    }
}
exports.ShopService = ShopService;
