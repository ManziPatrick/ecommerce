import prisma from "@/infra/database/database.config";
import { Prisma } from "@prisma/client";

export class WishlistRepository {
    async add(userId: string, variantId: string) {
        return prisma.wishlist.create({
            data: {
                userId,
                variantId,
            },
        });
    }

    async remove(userId: string, variantId: string) {
        return prisma.wishlist.deleteMany({
            where: {
                userId,
                variantId,
            },
        });
    }

    async findByUser(userId: string) {
        return prisma.wishlist.findMany({
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

    async findOne(userId: string, variantId: string) {
        return prisma.wishlist.findUnique({
            where: {
                userId_variantId: {
                    userId,
                    variantId,
                },
            },
        });
    }
}
