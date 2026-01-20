import AppError from "@/shared/errors/AppError";
import slugify from "@/shared/utils/slugify";
import ApiFeatures from "@/shared/utils/ApiFeatures";
import { ShopRepository } from "./shop.repository";
import prisma from "@/infra/database/database.config";

export class ShopService {
    constructor(private shopRepository: ShopRepository) { }

    async getAllShops(queryString: Record<string, any>) {
        const apiFeatures = new ApiFeatures(queryString)
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

    async getShop(shopId: string) {
        const shop = await this.shopRepository.findShopById(shopId);
        if (!shop) {
            throw new AppError(404, "Shop not found");
        }
        return shop;
    }

    async getShopBySlug(slug: string) {
        const shop = await this.shopRepository.findShopBySlug(slug);
        if (!shop) {
            throw new AppError(404, "Shop not found");
        }
        return shop;
    }

    async getShopByOwnerId(ownerId: string) {
        const shop = await this.shopRepository.findShopByOwnerId(ownerId);
        if (!shop) {
            throw new AppError(404, "Shop not found");
        }
        return shop;
    }

    async createShop(data: {
        name: string;
        description?: string;
        logo?: string;
        email?: string;
        phone?: string;
        country?: string;
        city?: string;
        village?: string;
        street?: string;
        placeName?: string;
        latitude?: number;
        longitude?: number;
        ownerId: string;
    }) {
        const slug = slugify(data.name);
        const existingShop = await (prisma as any).shop.findUnique({ where: { slug } });
        if (existingShop) {
            throw new AppError(400, "Shop with this name already exists");
        }

        // Check if user already has a shop (one shop per vendor for now)
        const userShop = await this.shopRepository.findShopByOwnerId(data.ownerId);
        if (userShop) {
            throw new AppError(400, "User already owns a shop");
        }

        // Ensure user exists and has VENDOR role (or upgrade them)
        const user = await (prisma as any).user.findUnique({ where: { id: data.ownerId } });
        if (!user) {
            throw new AppError(404, "User not found");
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
            await (prisma as any).user.update({
                where: { id: data.ownerId },
                data: { role: "VENDOR" as any },
            });
        }

        return { shop };
    }

    async updateShop(shopId: string, data: {
        name?: string;
        description?: string;
        logo?: string;
        email?: string;
        phone?: string;
        country?: string;
        city?: string;
        village?: string;
        street?: string;
        placeName?: string;
        latitude?: number;
        longitude?: number;
    }) {
        const shop = await this.shopRepository.findShopById(shopId);
        if (!shop) {
            throw new AppError(404, "Shop not found");
        }

        const slug = data.name ? slugify(data.name) : undefined;
        if (slug && slug !== shop.slug) {
            const existingShop = await (prisma as any).shop.findUnique({ where: { slug } });
            if (existingShop) {
                throw new AppError(400, "Shop with this name already exists");
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

    async deleteShop(shopId: string) {
        const shop = await this.shopRepository.findShopById(shopId);
        if (!shop) {
            throw new AppError(404, "Shop not found");
        }
        await this.shopRepository.deleteShop(shopId);
    }
}
