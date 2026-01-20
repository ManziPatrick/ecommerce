"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDashboardResolver = void 0;
const searchModel_1 = __importDefault(require("@/shared/utils/searchModel"));
exports.searchDashboardResolver = {
    Query: {
        searchDashboard: async (_, { params }, { prisma }) => {
            const { searchQuery } = params;
            const transactions = await (0, searchModel_1.default)("transaction", [{ name: "status", isString: false }], searchQuery, prisma);
            const products = await (0, searchModel_1.default)("product", [
                { name: "name", isString: true },
                { name: "description", isString: true },
            ], searchQuery, prisma);
            const categories = await (0, searchModel_1.default)("category", [
                { name: "name", isString: true },
                { name: "description", isString: true },
            ], searchQuery, prisma);
            const users = await (0, searchModel_1.default)("user", [
                { name: "name", isString: true },
                { name: "email", isString: true },
            ], searchQuery, prisma);
            const results = [
                ...transactions.map((t) => ({
                    type: "transaction",
                    id: t.id,
                    title: `Transaction #${t.id}`,
                    description: `$${t.amount || 0} - ${t.status || "Pending"}`,
                })),
                ...products.map((p) => ({
                    type: "product",
                    id: p.id,
                    title: p.name,
                    description: p.description || `$${p.variants?.[0]?.price || 0}`, // Updated to use variants
                })),
                ...categories.map((c) => ({
                    type: "category",
                    id: c.id,
                    title: c.name,
                    description: c.description,
                })),
                ...users.map((u) => ({
                    type: "user",
                    id: u.id,
                    title: u.name,
                    description: u.email,
                })),
            ];
            return results;
        },
    },
};
