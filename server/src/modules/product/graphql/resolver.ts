import AppError from "@/shared/errors/AppError";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export interface Context {
  prisma: PrismaClient;
  req: Request;
  res: Response;
}

export const productResolvers = {
  Query: {
    products: async (
      _: any,
      {
        first = 10,
        skip = 0,
        filters = {},
      }: {
        first?: number;
        skip?: number;
        filters?: {
          search?: string;
          isNew?: boolean;
          isFeatured?: boolean;
          isTrending?: boolean;
          isBestSeller?: boolean;
          minPrice?: number;
          maxPrice?: number;
          categoryId?: string;
          flags?: string[];
        };
      },
      context: Context
    ) => {
      const where: any = {};

      // Search filter
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      // Flag filters
      if (filters.isNew !== undefined) where.isNew = filters.isNew;
      if (filters.isFeatured !== undefined)
        where.isFeatured = filters.isFeatured;
      if (filters.isTrending !== undefined)
        where.isTrending = filters.isTrending;
      if (filters.isBestSeller !== undefined)
        where.isBestSeller = filters.isBestSeller;

      // ✅ OR logic for multiple flags
      if (filters.flags && filters.flags.length > 0) {
        const flagConditions = filters.flags.map((flag) => ({ [flag]: true }));
        if (!where.OR) where.OR = [];
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
        } else {
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
    shops: async (_: any, __: any, context: Context) => {
      console.log(`🔍 Fetching all shops`);
      const shops = await context.prisma.shop.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return shops;
    },
    shop: async (_: any, { slug }: { slug: string }, context: Context) => {
      console.log(`🔍 Fetching shop by slug: "${slug}"`);
      const shop = await context.prisma.shop.findUnique({
        where: { slug },
      });
      if (!shop) {
        throw new AppError(404, "Shop not found");
      }
      return shop;
    },
    shopById: async (_: any, { id }: { id: string }, context: Context) => {
      console.log(`🔍 Fetching shop by ID: "${id}"`);
      const shop = await context.prisma.shop.findUnique({
        where: { id },
      });
      if (!shop) {
        throw new AppError(404, "Shop not found");
      }
      return shop;
    },
    product: async (_: any, { slug }: { slug: string }, context: Context) => {
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
        throw new AppError(404, "Product not found");
      }
      console.log(`✅ GraphQL: Product found: "${product.name}" (ID: ${product.id})`);
      return product;
    },
    newProducts: async (
      _: any,
      { first = 10, skip = 0 }: { first?: number; skip?: number },
      context: Context
    ) => {
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
    featuredProducts: async (
      _: any,
      { first = 10, skip = 0 }: { first?: number; skip?: number },
      context: Context
    ) => {
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
    trendingProducts: async (
      _: any,
      { first = 10, skip = 0 }: { first?: number; skip?: number },
      context: Context
    ) => {
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
    bestSellerProducts: async (
      _: any,
      { first = 10, skip = 0 }: { first?: number; skip?: number },
      context: Context
    ) => {
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
    categories: async (_: any, __: any, context: Context) => {
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
    reviews: (parent: any, _: any, context: Context) => {
      return context.prisma.review.findMany({
        where: { productId: parent.id },
        include: {
          user: true,
        },
      });
    },
    shop: (parent: any, _: any, context: Context) => {
      if (!parent.shopId) return null;
      return context.prisma.shop.findUnique({
        where: { id: parent.shopId },
      });
    },
  },

  Shop: {
    products: (parent: any, _: any, context: Context) => {
      return context.prisma.product.findMany({
        where: { shopId: parent.id },
        include: {
          variants: true,
          reviews: true,
          category: true,
        },
      });
    },
  },
};
