import prisma from "@/infra/database/database.config";

export class ShopRepository {
    async findManyShops(params: {
        where?: Record<string, any>;
        orderBy?: Record<string, any> | Record<string, any>[];
        skip?: number;
        take?: number;
    }) {
        const { where, orderBy, skip, take } = params;
        return (prisma as any).shop.findMany({
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

    async countShops(params: { where?: Record<string, any> }) {
        const { where = {} } = params;
        return (prisma as any).shop.count({ where });
    }

    async findShopById(id: string) {
        return (prisma as any).shop.findUnique({
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

    async findShopBySlug(slug: string) {
        return (prisma as any).shop.findUnique({
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

    async createShop(data: {
        name: string;
        slug: string;
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
        return (prisma as any).shop.create({
            data,
        });
    }

    async updateShop(id: string, data: {
        name?: string;
        slug?: string;
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
        return (prisma as any).shop.update({
            where: { id },
            data,
        });
    }

    async deleteShop(id: string) {
        return (prisma as any).shop.delete({
            where: { id },
        });
    }

    async findShopByOwnerId(ownerId: string) {
        return (prisma as any).shop.findFirst({
            where: { ownerId },
        });
    }
}
