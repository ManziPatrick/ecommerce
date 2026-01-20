"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class ProductRepository {
    async findManyProducts(params) {
        const { where = {}, orderBy = { createdAt: "desc" }, skip = 0, take = 10, select, } = params;
        const { categorySlug, ...restWhere } = where;
        const finalWhere = {
            ...restWhere,
            ...(categorySlug
                ? {
                    category: {
                        is: {
                            slug: {
                                equals: categorySlug,
                                mode: "insensitive",
                            },
                        },
                    },
                }
                : {}),
            ...(params.shopId ? { shopId: params.shopId } : {}),
        };
        const queryOptions = {
            where: finalWhere,
            orderBy,
            skip,
            take,
        };
        if (select) {
            queryOptions.select = select;
        }
        else {
            queryOptions.include = {
                variants: {
                    include: {
                        attributes: {
                            include: {
                                attribute: true,
                                value: true,
                            },
                        },
                    },
                },
            };
        }
        return database_config_1.default.product.findMany(queryOptions);
    }
    async countProducts(params) {
        const { where = {} } = params;
        return database_config_1.default.product.count({ where });
    }
    async findProductById(id, tx) {
        const client = tx || database_config_1.default;
        return client.product.findUnique({
            where: { id },
            include: {
                category: true,
                shop: true,
                variants: {
                    include: {
                        attributes: {
                            include: {
                                attribute: true,
                                value: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findProductByName(name) {
        return database_config_1.default.product.findUnique({
            where: { name },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });
    }
    async findProductBySlug(slug) {
        return database_config_1.default.product.findUnique({
            where: { slug },
            include: {
                category: true,
                variants: {
                    include: {
                        attributes: {
                            include: {
                                attribute: true,
                                value: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findProductNameById(id) {
        const product = await database_config_1.default.product.findUnique({
            where: { id },
            select: { name: true },
        });
        return product?.name || null;
    }
    async createProduct(data, tx) {
        const client = tx || database_config_1.default;
        return client.product.create({
            data,
        });
    }
    async createManyProducts(data) {
        return database_config_1.default.product.createMany({
            data,
            skipDuplicates: true,
        });
    }
    async incrementSalesCount(id, quantity) {
        return database_config_1.default.product.update({
            where: { id },
            data: { salesCount: { increment: quantity } },
        });
    }
    async updateProduct(id, data, tx) {
        const client = tx || database_config_1.default;
        return client.product.update({
            where: { id },
            data,
            include: {
                category: true,
                variants: {
                    include: {
                        attributes: {
                            include: {
                                attribute: true,
                                value: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async deleteProduct(id) {
        return database_config_1.default.product.delete({
            where: { id },
        });
    }
}
exports.ProductRepository = ProductRepository;
