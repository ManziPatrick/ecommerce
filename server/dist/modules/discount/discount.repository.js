"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class DiscountRepository {
    async create(data) {
        return database_config_1.default.discount.create({ data });
    }
    async findByCode(code) {
        return database_config_1.default.discount.findUnique({
            where: { code },
        });
    }
    async findById(id) {
        return database_config_1.default.discount.findUnique({
            where: { id },
        });
    }
    async findAll(where = {}) {
        return database_config_1.default.discount.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
    }
    async update(id, data) {
        return database_config_1.default.discount.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return database_config_1.default.discount.delete({
            where: { id },
        });
    }
    async incrementUsedCount(id) {
        return database_config_1.default.discount.update({
            where: { id },
            data: {
                usedCount: {
                    increment: 1,
                },
            },
        });
    }
}
exports.DiscountRepository = DiscountRepository;
