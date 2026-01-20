"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
class DiscountService {
    constructor(discountRepository) {
        this.discountRepository = discountRepository;
    }
    async createDiscount(data) {
        const existing = await this.discountRepository.findByCode(data.code);
        if (existing) {
            throw new AppError_1.default(400, "Discount code already exists");
        }
        return this.discountRepository.create(data);
    }
    async getAllDiscounts() {
        return this.discountRepository.findAll();
    }
    async getDiscountByCode(code) {
        const discount = await this.discountRepository.findByCode(code);
        if (!discount) {
            throw new AppError_1.default(404, "Discount code not found");
        }
        return discount;
    }
    async validateDiscount(code, orderAmount) {
        const discount = await this.discountRepository.findByCode(code);
        if (!discount) {
            throw new AppError_1.default(404, "Discount code not found");
        }
        if (!discount.isActive) {
            throw new AppError_1.default(400, "Discount code is not active");
        }
        if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
            throw new AppError_1.default(400, "Discount code has expired");
        }
        if (discount.maxUses && discount.usedCount >= discount.maxUses) {
            throw new AppError_1.default(400, "Discount code usage limit reached");
        }
        if (orderAmount < discount.minOrderAmount) {
            throw new AppError_1.default(400, `Minimum order amount of ${discount.minOrderAmount} required to apply this discount`);
        }
        return discount;
    }
    async updateDiscount(id, data) {
        return this.discountRepository.update(id, data);
    }
    async deleteDiscount(id) {
        return this.discountRepository.delete(id);
    }
    async useDiscount(id) {
        return this.discountRepository.incrementUsedCount(id);
    }
}
exports.DiscountService = DiscountService;
