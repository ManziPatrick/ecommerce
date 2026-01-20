import { DiscountRepository } from "./discount.repository";
import AppError from "@/shared/errors/AppError";
import { DISCOUNT_TYPE } from "@prisma/client";

export class DiscountService {
    constructor(private discountRepository: DiscountRepository) { }

    async createDiscount(data: {
        code: string;
        type: DISCOUNT_TYPE;
        value: number;
        minOrderAmount?: number;
        maxUses?: number;
        expiresAt?: Date;
    }) {
        const existing = await this.discountRepository.findByCode(data.code);
        if (existing) {
            throw new AppError(400, "Discount code already exists");
        }

        return this.discountRepository.create(data);
    }

    async getAllDiscounts() {
        return this.discountRepository.findAll();
    }

    async getDiscountByCode(code: string) {
        const discount = await this.discountRepository.findByCode(code);
        if (!discount) {
            throw new AppError(404, "Discount code not found");
        }
        return discount;
    }

    async validateDiscount(code: string, orderAmount: number) {
        const discount = await this.discountRepository.findByCode(code);

        if (!discount) {
            throw new AppError(404, "Discount code not found");
        }

        if (!discount.isActive) {
            throw new AppError(400, "Discount code is not active");
        }

        if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
            throw new AppError(400, "Discount code has expired");
        }

        if (discount.maxUses && discount.usedCount >= discount.maxUses) {
            throw new AppError(400, "Discount code usage limit reached");
        }

        if (orderAmount < discount.minOrderAmount) {
            throw new AppError(
                400,
                `Minimum order amount of ${discount.minOrderAmount} required to apply this discount`
            );
        }

        return discount;
    }

    async updateDiscount(id: string, data: any) {
        return this.discountRepository.update(id, data);
    }

    async deleteDiscount(id: string) {
        return this.discountRepository.delete(id);
    }

    async useDiscount(id: string) {
        return this.discountRepository.incrementUsedCount(id);
    }
}
