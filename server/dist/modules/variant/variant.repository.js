"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariantRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class VariantRepository {
    async findManyVariants(params) {
        const { where = {}, orderBy = { createdAt: "desc" }, skip = 0, take = 10, select, } = params;
        const { productSlug, shopId, ...restWhere } = where;
        const finalWhere = {
            ...restWhere,
            ...(productSlug
                ? {
                    product: {
                        slug: {
                            equals: productSlug,
                            mode: "insensitive",
                        },
                    },
                }
                : {}),
            ...(shopId
                ? {
                    product: {
                        shopId: {
                            equals: shopId,
                        },
                    },
                }
                : {}),
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
                product: true,
                attributes: {
                    include: {
                        attribute: true,
                        value: true,
                    },
                },
            };
        }
        return database_config_1.default.productVariant.findMany(queryOptions);
    }
    async countVariants(params) {
        const { where = {} } = params;
        const { shopId, ...restWhere } = where;
        const finalWhere = {
            ...restWhere,
            ...(shopId
                ? {
                    product: {
                        shopId: {
                            equals: shopId,
                        },
                    },
                }
                : {}),
        };
        return database_config_1.default.productVariant.count({ where: finalWhere });
    }
    async findVariantById(id) {
        return database_config_1.default.productVariant.findUnique({
            where: { id },
            include: {
                product: true,
                attributes: {
                    include: {
                        attribute: true,
                        value: true,
                    },
                },
            },
        });
    }
    async findVariantBySku(sku) {
        return database_config_1.default.productVariant.findUnique({
            where: { sku },
            include: {
                product: true,
                attributes: {
                    include: {
                        attribute: true,
                        value: true,
                    },
                },
            },
        });
    }
    async findRestockHistory(params) {
        const { variantId, skip = 0, take = 10 } = params;
        return database_config_1.default.restock.findMany({
            where: { variantId },
            orderBy: { createdAt: "desc" },
            skip,
            take,
            include: {
                variant: true,
                user: { select: { id: true, name: true } },
            },
        });
    }
    async countRestocks(params) {
        return database_config_1.default.restock.count({ where: { variantId: params.variantId } });
    }
    async createVariant(data, tx) {
        const { attributes, ...variantData } = data;
        const client = tx || database_config_1.default;
        return client.productVariant.create({
            data: {
                ...variantData,
                discountPrice: variantData.discountPrice,
                attributes: {
                    create: attributes.map((attr) => ({
                        attributeId: attr.attributeId,
                        valueId: attr.valueId,
                    })),
                },
            },
            include: {
                attributes: {
                    include: {
                        attribute: true,
                        value: true,
                    },
                },
                product: true,
            },
        });
    }
    async updateVariant(id, data) {
        const { attributes, ...variantData } = data;
        return database_config_1.default.productVariant.update({
            where: { id },
            data: {
                ...variantData,
                ...(attributes
                    ? {
                        attributes: {
                            deleteMany: {},
                            create: attributes.map((attr) => ({
                                attributeId: attr.attributeId,
                                valueId: attr.valueId,
                            })),
                        },
                    }
                    : {}),
            },
            include: {
                attributes: {
                    include: {
                        attribute: true,
                        value: true,
                    },
                },
                product: true,
            },
        });
    }
    async deleteVariant(id) {
        return database_config_1.default.productVariant.delete({
            where: { id },
        });
    }
    async createRestock(data) {
        return database_config_1.default.restock.create({
            data,
            include: { variant: true },
        });
    }
    async updateVariantStock(variantId, quantity) {
        return database_config_1.default.productVariant.update({
            where: { id: variantId },
            data: { stock: { increment: quantity } },
        });
    }
    async createStockMovement(data) {
        return database_config_1.default.stockMovement.create({
            data,
        });
    }
}
exports.VariantRepository = VariantRepository;
