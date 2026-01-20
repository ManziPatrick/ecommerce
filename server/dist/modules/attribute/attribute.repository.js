"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class AttributeRepository {
    async createAttribute(data) {
        return database_config_1.default.attribute.create({ data });
    }
    async createAttributeValue(data) {
        return database_config_1.default.attributeValue.create({ data });
    }
    async assignAttributeToCategory(data) {
        return database_config_1.default.categoryAttribute.create({ data });
    }
    // async assignAttributeToProduct(data: {
    //   productId: string;
    //   attributeId: string;
    //   valueId?: string;
    //   customValue?: string;
    // }) {
    //   return prisma.productAttribute.create({ data });
    // }
    async findManyAttributes(params) {
        const { where, orderBy = { createdAt: "desc" }, skip = 0, take = 10, } = params;
        return database_config_1.default.attribute.findMany({
            where,
            orderBy,
            skip,
            take,
            include: { values: true, categories: { include: { category: true } } },
        });
    }
    async countAttributes(params) {
        const { where = {} } = params;
        return database_config_1.default.attribute.count({ where });
    }
    async findAttributeById(id) {
        return database_config_1.default.attribute.findUnique({
            where: { id },
            include: { values: true },
        });
    }
    async findAttributeValueById(id) {
        return database_config_1.default.attributeValue.findUnique({
            where: { id },
            include: { attribute: true },
        });
    }
    async deleteAttribute(id) {
        return database_config_1.default.attribute.delete({ where: { id } });
    }
    async deleteAttributeValue(id) {
        return database_config_1.default.attributeValue.delete({ where: { id } });
    }
}
exports.AttributeRepository = AttributeRepository;
