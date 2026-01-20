"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariantService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
const ApiFeatures_1 = __importDefault(require("@/shared/utils/ApiFeatures"));
class VariantService {
    constructor(variantRepository, attributeRepository) {
        this.variantRepository = variantRepository;
        this.attributeRepository = attributeRepository;
    }
    async getAllVariants(queryString, userId, userRole) {
        const apiFeatures = new ApiFeatures_1.default(queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            .build();
        let { where, orderBy, skip, take, select } = apiFeatures;
        // Data isolation for vendors
        if (userRole === "VENDOR") {
            const shop = await database_config_1.default.shop.findFirst({ where: { ownerId: userId } });
            if (shop) {
                where = { ...where, shopId: shop.id };
            }
        }
        const finalWhere = where && Object.keys(where).length > 0 ? where : {};
        const totalResults = await this.variantRepository.countVariants({
            where: finalWhere,
        });
        const totalPages = Math.ceil(totalResults / take);
        const currentPage = Math.floor(skip / take) + 1;
        const variants = await this.variantRepository.findManyVariants({
            where: finalWhere,
            orderBy: orderBy || { createdAt: "desc" },
            skip,
            take,
            select,
        });
        return {
            variants,
            totalResults,
            totalPages,
            currentPage,
            resultsPerPage: take,
        };
    }
    async getRestockHistory(variantId, page = 1, limit = 10, userId, userRole) {
        // Authorization check
        if (userRole === "VENDOR") {
            const variant = await this.variantRepository.findVariantById(variantId);
            if (!variant)
                throw new AppError_1.default(404, "Variant not found");
            const shop = await database_config_1.default.shop.findFirst({ where: { ownerId: userId } });
            if (!shop || variant.product.shopId !== shop.id) {
                throw new AppError_1.default(403, "You are not authorized to view this restock history");
            }
        }
        const skip = (page - 1) * limit;
        const take = limit;
        const totalResults = await this.variantRepository.countRestocks({
            variantId,
        });
        const totalPages = Math.ceil(totalResults / take);
        const currentPage = page;
        const restocks = await this.variantRepository.findRestockHistory({
            variantId,
            skip,
            take,
        });
        return {
            restocks,
            totalResults,
            totalPages,
            currentPage,
            resultsPerPage: take,
        };
    }
    async getVariantById(variantId) {
        const variant = await this.variantRepository.findVariantById(variantId);
        if (!variant) {
            throw new AppError_1.default(404, "Variant not found");
        }
        return variant;
    }
    async getVariantBySku(sku) {
        const variant = await this.variantRepository.findVariantBySku(sku);
        if (!variant) {
            throw new AppError_1.default(404, "Variant not found");
        }
        return variant;
    }
    async createVariant(data, userId, userRole) {
        const { productId, attributes } = data;
        // Authorization check for vendors
        if (userRole === "VENDOR") {
            const product = await database_config_1.default.product.findUnique({ where: { id: productId } });
            if (!product)
                throw new AppError_1.default(404, "Product not found");
            const shop = await database_config_1.default.shop.findFirst({ where: { ownerId: userId } });
            if (!shop || product.shopId !== shop.id) {
                throw new AppError_1.default(403, "You can only create variants for your own products");
            }
        }
        const product = await database_config_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new AppError_1.default(404, "Product not found");
        }
        const existingVariant = await database_config_1.default.productVariant.findUnique({
            where: { sku: data.sku },
        });
        if (existingVariant) {
            throw new AppError_1.default(400, "SKU already exists");
        }
        if (!attributes || attributes.length === 0) {
            throw new AppError_1.default(400, "At least one attribute is required");
        }
        if (product.categoryId) {
            const requiredAttributes = await database_config_1.default.categoryAttribute.findMany({
                where: { categoryId: product.categoryId, isRequired: true },
                select: { attributeId: true },
            });
            const requiredAttributeIds = requiredAttributes.map((attr) => attr.attributeId);
            const variantAttributeIds = attributes.map((attr) => attr.attributeId);
            const missingAttributes = requiredAttributeIds.filter((id) => !variantAttributeIds.includes(id));
            if (missingAttributes.length > 0) {
                throw new AppError_1.default(400, `Variant is missing required attributes: ${missingAttributes.join(", ")}`);
            }
        }
        const allAttributeIds = [...new Set(attributes.map((a) => a.attributeId))];
        const existingAttributes = await database_config_1.default.attribute.findMany({
            where: { id: { in: allAttributeIds } },
        });
        if (existingAttributes.length !== allAttributeIds.length) {
            throw new AppError_1.default(400, "One or more attributes are invalid");
        }
        const allValueIds = [...new Set(attributes.map((a) => a.valueId))];
        const existingValues = await database_config_1.default.attributeValue.findMany({
            where: { id: { in: allValueIds } },
        });
        if (existingValues.length !== allValueIds.length) {
            throw new AppError_1.default(400, "One or more attribute values are invalid");
        }
        if (new Set(allAttributeIds).size !== allAttributeIds.length) {
            throw new AppError_1.default(400, "Duplicate attributes in variant");
        }
        const existingVariants = await database_config_1.default.productVariant.findMany({
            where: { productId },
            include: { attributes: true },
        });
        const newComboKey = attributes
            .map((a) => `${a.attributeId}:${a.valueId}`)
            .sort()
            .join("|");
        const isDuplicateCombo = existingVariants.some((v) => v.attributes
            .map((a) => `${a.attributeId}:${a.valueId}`)
            .sort()
            .join("|") === newComboKey);
        if (isDuplicateCombo) {
            throw new AppError_1.default(400, "Duplicate attribute combination for this product");
        }
        return this.variantRepository.createVariant(data);
    }
    async updateVariant(variantId, data, userId, userRole) {
        const existingVariant = await this.variantRepository.findVariantById(variantId);
        if (!existingVariant) {
            throw new AppError_1.default(404, "Variant not found");
        }
        // Authorization check
        if (userRole === "VENDOR") {
            const shop = await database_config_1.default.shop.findFirst({ where: { ownerId: userId } });
            if (!shop || existingVariant.product.shopId !== shop.id) {
                throw new AppError_1.default(403, "You are not authorized to update this variant");
            }
        }
        if (data.sku && data.sku !== existingVariant.sku) {
            const existingSku = await database_config_1.default.productVariant.findUnique({
                where: { sku: data.sku },
            });
            if (existingSku) {
                throw new AppError_1.default(400, "SKU already exists");
            }
        }
        if (data.attributes) {
            if (data.attributes.length === 0) {
                throw new AppError_1.default(400, "At least one attribute is required");
            }
            const product = await database_config_1.default.product.findUnique({
                where: { id: existingVariant.productId },
            });
            if (product?.categoryId) {
                const requiredAttributes = await database_config_1.default.categoryAttribute.findMany({
                    where: { categoryId: product.categoryId, isRequired: true },
                    select: { attributeId: true },
                });
                const requiredAttributeIds = requiredAttributes.map((attr) => attr.attributeId);
                const variantAttributeIds = data.attributes.map((attr) => attr.attributeId);
                const missingAttributes = requiredAttributeIds.filter((id) => !variantAttributeIds.includes(id));
                if (missingAttributes.length > 0) {
                    throw new AppError_1.default(400, `Variant is missing required attributes: ${missingAttributes.join(", ")}`);
                }
            }
            const allAttributeIds = [
                ...new Set(data.attributes.map((a) => a.attributeId)),
            ];
            const existingAttributes = await database_config_1.default.attribute.findMany({
                where: { id: { in: allAttributeIds } },
            });
            if (existingAttributes.length !== allAttributeIds.length) {
                throw new AppError_1.default(400, "One or more attributes are invalid");
            }
            const allValueIds = [...new Set(data.attributes.map((a) => a.valueId))];
            const existingValues = await database_config_1.default.attributeValue.findMany({
                where: { id: { in: allValueIds } },
            });
            if (existingValues.length !== allValueIds.length) {
                throw new AppError_1.default(400, "One or more attribute values are invalid");
            }
            if (new Set(allAttributeIds).size !== allAttributeIds.length) {
                throw new AppError_1.default(400, "Duplicate attributes in variant");
            }
            const existingVariants = await database_config_1.default.productVariant.findMany({
                where: { productId: existingVariant.productId, id: { not: variantId } },
                include: { attributes: true },
            });
            const newComboKey = data.attributes
                .map((a) => `${a.attributeId}:${a.valueId}`)
                .sort()
                .join("|");
            const isDuplicateCombo = existingVariants.some((v) => v.attributes
                .map((a) => `${a.attributeId}:${a.valueId}`)
                .sort()
                .join("|") === newComboKey);
            if (isDuplicateCombo) {
                throw new AppError_1.default(400, "Duplicate attribute combination for this product");
            }
        }
        return this.variantRepository.updateVariant(variantId, data);
    }
    async restockVariant(variantId, quantity, notes, userId) {
        if (quantity <= 0) {
            throw new AppError_1.default(400, "Quantity must be positive");
        }
        const existingVariant = await this.variantRepository.findVariantById(variantId);
        if (!existingVariant) {
            throw new AppError_1.default(404, "Variant not found");
        }
        return database_config_1.default.$transaction(async (tx) => {
            const restock = await this.variantRepository.createRestock({
                variantId,
                quantity,
                notes,
                userId,
            });
            await this.variantRepository.updateVariantStock(variantId, quantity);
            await this.variantRepository.createStockMovement({
                variantId,
                quantity,
                reason: "restock",
                userId,
            });
            const updatedVariant = await this.variantRepository.findVariantById(variantId);
            const isLowStock = updatedVariant?.stock && updatedVariant.lowStockThreshold
                ? updatedVariant.stock <= updatedVariant.lowStockThreshold
                : false;
            return { restock, isLowStock };
        });
    }
    async deleteVariant(variantId, userId, userRole) {
        const variant = await this.variantRepository.findVariantById(variantId);
        if (!variant) {
            throw new AppError_1.default(404, "Variant not found");
        }
        // Authorization check
        if (userRole === "VENDOR") {
            const shop = await database_config_1.default.shop.findFirst({ where: { ownerId: userId } });
            if (!shop || variant.product.shopId !== shop.id) {
                throw new AppError_1.default(403, "You are not authorized to delete this variant");
            }
        }
        await this.variantRepository.deleteVariant(variantId);
    }
}
exports.VariantService = VariantService;
