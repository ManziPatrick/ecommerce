"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productResolvers = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
exports.productResolvers = {
    Query: {
        products: async (_, { first = 10, skip = 0, filters = {}, }, context) => {
            const where = {};
            // Search filter
            if (filters.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: "insensitive" } },
                    { description: { contains: filters.search, mode: "insensitive" } },
                ];
            }
            // Flag filters
            if (filters.isNew !== undefined)
                where.isNew = filters.isNew;
            if (filters.isFeatured !== undefined)
                where.isFeatured = filters.isFeatured;
            if (filters.isTrending !== undefined)
                where.isTrending = filters.isTrending;
            if (filters.isBestSeller !== undefined)
                where.isBestSeller = filters.isBestSeller;
            // ✅ OR logic for multiple flags
            if (filters.flags && filters.flags.length > 0) {
                const flagConditions = filters.flags.map((flag) => ({ [flag]: true }));
                if (!where.OR)
                    where.OR = [];
                where.OR = [...where.OR, ...flagConditions];
            }
            // Category filter
            if (filters.categoryId) {
                where.categoryId = filters.categoryId;
            }
            // Role-based filtering for Vendors
            if (context.req.user?.role === "VENDOR") {
                const shop = await context.prisma.shop.findFirst({
                    where: { ownerId: context.req.user.id },
                });
                if (shop) {
                    where.shopId = shop.id;
                }
                else {
                    // If vendor has no shop, return no products
                    where.shopId = "none";
                }
            }
            // Price filter (based on variants)
            if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
                where.variants = {
                    some: {
                        price: {
                            ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
                            ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
                        },
                    },
                };
            }
            const totalCount = await context.prisma.product.count({ where });
            const products = await context.prisma.product.findMany({
                where,
                take: first,
                skip,
                include: {
                    category: true,
                    variants: true,
                    reviews: true,
                },
            });
            return {
                products,
                hasMore: skip + products.length < totalCount,
                totalCount,
            };
        },
        product: async (_, { slug }, context) => {
            console.log(`🔍 GraphQL: Fetching product by slug: "${slug}"`);
            const product = await context.prisma.product.findUnique({
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
                    reviews: true,
                },
            });
            if (!product) {
                console.log(`❌ GraphQL: Product not found for slug: "${slug}"`);
                throw new AppError_1.default(404, "Product not found");
            }
            console.log(`✅ GraphQL: Product found: "${product.name}" (ID: ${product.id})`);
            return product;
        },
        newProducts: async (_, { first = 10, skip = 0 }, context) => {
            const totalCount = await context.prisma.product.count({
                where: { isNew: true },
            });
            const products = await context.prisma.product.findMany({
                where: { isNew: true },
                take: first,
                skip,
                include: {
                    category: true,
                    variants: true,
                    reviews: true,
                },
            });
            return {
                products,
                hasMore: skip + products.length < totalCount,
                totalCount,
            };
        },
        featuredProducts: async (_, { first = 10, skip = 0 }, context) => {
            const totalCount = await context.prisma.product.count({
                where: { isFeatured: true },
            });
            const products = await context.prisma.product.findMany({
                where: { isFeatured: true },
                take: first,
                skip,
                include: {
                    category: true,
                    variants: true,
                    reviews: true,
                },
            });
            return {
                products,
                hasMore: skip + products.length < totalCount,
                totalCount,
            };
        },
        trendingProducts: async (_, { first = 10, skip = 0 }, context) => {
            const totalCount = await context.prisma.product.count({
                where: { isTrending: true },
            });
            const products = await context.prisma.product.findMany({
                where: { isTrending: true },
                take: first,
                skip,
                include: {
                    category: true,
                    variants: true,
                    reviews: true,
                },
            });
            return {
                products,
                hasMore: skip + products.length < totalCount,
                totalCount,
            };
        },
        bestSellerProducts: async (_, { first = 10, skip = 0 }, context) => {
            const totalCount = await context.prisma.product.count({
                where: { isBestSeller: true },
            });
            const products = await context.prisma.product.findMany({
                where: { isBestSeller: true },
                take: first,
                skip,
                include: {
                    category: true,
                    variants: true,
                    reviews: true,
                },
            });
            return {
                products,
                hasMore: skip + products.length < totalCount,
                totalCount,
            };
        },
        categories: async (_, __, context) => {
            return context.prisma.category.findMany({
                include: {
                    products: {
                        include: {
                            variants: true,
                        },
                    },
                },
            });
        },
    },
    Product: {
        reviews: (parent, _, context) => {
            return context.prisma.review.findMany({
                where: { productId: parent.id },
                include: {
                    user: true,
                },
            });
        },
        shop: (parent, _, context) => {
            if (!parent.shopId)
                return null;
            return context.prisma.shop.findUnique({
                where: { id: parent.shopId },
            });
        },
    },
};
