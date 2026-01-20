import prisma from "@/infra/database/database.config";
import { DISCOUNT_TYPE, Prisma } from "@prisma/client";

export class DiscountRepository {
    async create(data: Prisma.DiscountCreateInput) {
        return prisma.discount.create({ data });
    }

    async findByCode(code: string) {
        return prisma.discount.findUnique({
            where: { code },
        });
    }

    async findById(id: string) {
        return prisma.discount.findUnique({
            where: { id },
        });
    }

    async findAll(where: Prisma.DiscountWhereInput = {}) {
        return prisma.discount.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
    }

    async update(id: string, data: Prisma.DiscountUpdateInput) {
        return prisma.discount.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return prisma.discount.delete({
            where: { id },
        });
    }

    async incrementUsedCount(id: string) {
        return prisma.discount.update({
            where: { id },
            data: {
                usedCount: {
                    increment: 1,
                },
            },
        });
    }
}
