"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yearRange = {
    Query: {
        yearRange: async (_, __, { prisma }) => {
            const orders = await prisma.order.aggregate({
                _min: { orderDate: true },
                _max: { orderDate: true },
            });
            const minYear = orders._min.orderDate?.getFullYear() || new Date().getFullYear();
            const maxYear = orders._max.orderDate?.getFullYear() || new Date().getFullYear();
            return { minYear, maxYear };
        },
    },
};
exports.default = yearRange;
