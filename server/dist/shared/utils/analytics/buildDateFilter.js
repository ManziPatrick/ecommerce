"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDateFilter = void 0;
const buildDateFilter = (startDate, endDate, yearStart, yearEnd) => ({
    ...(startDate && { gte: startDate }),
    ...(endDate && { lte: new Date(endDate) }),
    ...(yearStart && { gte: yearStart }),
    ...(yearEnd && { lte: yearEnd }),
});
exports.buildDateFilter = buildDateFilter;
