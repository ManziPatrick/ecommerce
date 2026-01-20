"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class CategoryRepository {
    async findManyCategories(params) {
        const { where, orderBy, skip, take, includeProducts } = params;
        return database_config_1.default.category.findMany({
            where,
            orderBy: orderBy || { createdAt: "desc" },
            skip,
            take,
            include: {
                attributes: { include: { attribute: { include: { values: true } } } },
                products: includeProducts
                    ? { include: { variants: { select: { id: true, sku: true, price: true, stock: true } } } }
                    : false,
            },
        });
    }
    async countCategories(params) {
        const { where = {} } = params;
        return database_config_1.default.category.count({ where });
    }
    async findCategoryById(id, includeProducts = false) {
        return database_config_1.default.category.findUnique({
            where: { id },
            include: {
                attributes: { include: { attribute: { include: { values: true } } } },
                products: includeProducts
                    ? { include: { variants: { select: { id: true, sku: true, price: true, stock: true } } } }
                    : false,
            },
        });
    }
    async createCategory(data) {
        return database_config_1.default.category.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                images: data.images,
                attributes: data.attributes
                    ? {
                        create: data.attributes.map((attr) => ({
                            attributeId: attr.attributeId,
                            isRequired: attr.isRequired,
                        })),
                    }
                    : undefined,
            },
        });
    }
    async updateCategory(id, data) {
        return database_config_1.default.category.update({
            where: { id },
            data,
        });
    }
    async deleteCategory(id) {
        return database_config_1.default.category.delete({
            where: { id },
        });
    }
    async addCategoryAttribute(categoryId, attributeId, isRequired) {
        return database_config_1.default.categoryAttribute.create({
            data: {
                categoryId,
                attributeId,
                isRequired,
            },
        });
    }
    async removeCategoryAttribute(categoryId, attributeId) {
        return database_config_1.default.categoryAttribute.delete({
            where: { categoryId_attributeId: { categoryId, attributeId } },
        });
    }
}
exports.CategoryRepository = CategoryRepository;
