"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const slugify_1 = __importDefault(require("@/shared/utils/slugify"));
const ApiFeatures_1 = __importDefault(require("@/shared/utils/ApiFeatures"));
class AttributeService {
    constructor(attributeRepository) {
        this.attributeRepository = attributeRepository;
    }
    async createAttribute(data) {
        const slug = (0, slugify_1.default)(data.name);
        return await this.attributeRepository.createAttribute({ ...data, slug });
    }
    async createAttributeValue(data) {
        const slug = (0, slugify_1.default)(data.value);
        return await this.attributeRepository.createAttributeValue({
            ...data,
            slug,
        });
    }
    async assignAttributeToCategory(data) {
        return await this.attributeRepository.assignAttributeToCategory(data);
    }
    // async assignAttributeToProduct(data: {
    //   productId: string;
    //   attributeId: string;
    //   valueId?: string;
    //   customValue?: string;
    // }) {
    //   return await this.attributeRepository.assignAttributeToProduct(data);
    // }
    async getAllAttributes(queryString) {
        const apiFeatures = new ApiFeatures_1.default(queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            .build();
        const { where, orderBy, skip, take } = apiFeatures;
        const totalResults = await this.attributeRepository.countAttributes({
            where,
        });
        const totalPages = Math.ceil(totalResults / take);
        const currentPage = Math.floor(skip / take) + 1;
        const attributes = await this.attributeRepository.findManyAttributes(apiFeatures);
        return {
            attributes,
            totalResults,
            totalPages,
            currentPage,
            resultsPerPage: take,
        };
    }
    async getAttribute(id) {
        const attribute = await this.attributeRepository.findAttributeById(id);
        if (!attribute) {
            throw new AppError_1.default(404, "Attribute not found");
        }
        return attribute;
    }
    async deleteAttribute(id) {
        const attribute = await this.attributeRepository.findAttributeById(id);
        if (!attribute) {
            throw new AppError_1.default(404, "Attribute not found");
        }
        await this.attributeRepository.deleteAttribute(id);
    }
    async deleteAttributeValue(id) {
        const attributeValue = await this.attributeRepository.findAttributeValueById(id);
        if (!attributeValue) {
            throw new AppError_1.default(404, "Attribute value not found");
        }
        await this.attributeRepository.deleteAttributeValue(id);
    }
}
exports.AttributeService = AttributeService;
