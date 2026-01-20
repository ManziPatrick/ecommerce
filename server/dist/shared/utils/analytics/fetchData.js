"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchData = void 0;
const _1 = require(".");
const fetchData = async (prisma, model, dateField, startDate, endDate, yearStart, yearEnd, role, include, shopId) => {
    const where = {
        [dateField]: (0, _1.buildDateFilter)(startDate, endDate, yearStart, yearEnd),
    };
    if (role)
        where.role = role;
    if (shopId) {
        if (model === "order") {
            where.orderItems = { some: { shopId } };
        }
        else if (model === "user") {
            where.orders = { some: { orderItems: { some: { shopId } } } };
        }
        else if (model === "orderItem" || model === "product") {
            where.shopId = shopId;
        }
        else if (model === "interaction") {
            where.product = { shopId };
        }
    }
    return prisma[model].findMany({ where, include });
};
exports.fetchData = fetchData;
