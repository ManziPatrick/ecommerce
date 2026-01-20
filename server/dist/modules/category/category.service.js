"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const slugify_1 = __importDefault(require("@/shared/utils/slugify"));
const ApiFeatures_1 = __importDefault(require("@/shared/utils/ApiFeatures"));
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async getAllCategories(queryString) {
        const apiFeatures = new ApiFeatures_1.default(queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            .build();
        const { where, orderBy, skip, take } = apiFeatures;
        const totalResults = await this.categoryRepository.countCategories({
            where,
        });
        const totalPages = Math.ceil(totalResults / take);
        const currentPage = Math.floor(skip / take) + 1;
        const categories = await this.categoryRepository.findManyCategories({
            where,
            orderBy,
            skip,
            take,
            includeProducts: true,
        });
        return {
            categories,
            totalResults,
            totalPages,
            currentPage,
            resultsPerPage: take,
        };
    }
    async getCategory(categoryId) {
        const category = await this.categoryRepository.findCategoryById(categoryId, true);
        if (!category) {
            throw new AppError_1.default(404, "Category not found");
        }
        return {
            ...category,
            productCount: category.products?.length || 0,
        };
    }
    async createCategory(data) {
        const slug = (0, slugify_1.default)(data.name);
        const existingCategory = await database_config_1.default.category.findUnique({ where: { slug } });
        if (existingCategory) {
            throw new AppError_1.default(400, "Category with this name already exists");
        }
        // Validate attributes
        if (data.attributes) {
            for (const attr of data.attributes) {
                const attribute = await database_config_1.default.attribute.findUnique({ where: { id: attr.attributeId } });
                if (!attribute) {
                    throw new AppError_1.default(404, `Attribute not found: ${attr.attributeId}`);
                }
            }
        }
        const category = await this.categoryRepository.createCategory({
            name: data.name,
            slug,
            description: data.description,
            images: data.images,
            attributes: data.attributes,
        });
        return { category };
    }
    async updateCategory(categoryId, data) {
        const category = await this.categoryRepository.findCategoryById(categoryId);
        if (!category) {
            throw new AppError_1.default(404, "Category not found");
        }
        const slug = data.name ? (0, slugify_1.default)(data.name) : undefined;
        if (slug && slug !== category.slug) {
            const existingCategory = await database_config_1.default.category.findUnique({ where: { slug } });
            if (existingCategory) {
                throw new AppError_1.default(400, "Category with this name already exists");
            }
        }
        const updatedCategory = await this.categoryRepository.updateCategory(categoryId, {
            name: data.name,
            slug,
            description: data.description,
            images: data.images,
        });
        return { category: updatedCategory };
    }
    async deleteCategory(categoryId) {
        const category = await this.categoryRepository.findCategoryById(categoryId);
        if (!category) {
            throw new AppError_1.default(404, "Category not found");
        }
        await this.categoryRepository.deleteCategory(categoryId);
    }
    async addCategoryAttribute(categoryId, attributeId, isRequired) {
        const category = await this.categoryRepository.findCategoryById(categoryId);
        if (!category) {
            throw new AppError_1.default(404, "Category not found");
        }
        const attribute = await database_config_1.default.attribute.findUnique({ where: { id: attributeId } });
        if (!attribute) {
            throw new AppError_1.default(404, "Attribute not found");
        }
        const existing = await database_config_1.default.categoryAttribute.findUnique({
            where: { categoryId_attributeId: { categoryId, attributeId } },
        });
        if (existing) {
            throw new AppError_1.default(400, "Attribute already assigned to category");
        }
        const categoryAttribute = await this.categoryRepository.addCategoryAttribute(categoryId, attributeId, isRequired);
        return { categoryAttribute };
    }
    async removeCategoryAttribute(categoryId, attributeId) {
        const category = await this.categoryRepository.findCategoryById(categoryId);
        if (!category) {
            throw new AppError_1.default(404, "Category not found");
        }
        const attribute = await database_config_1.default.attribute.findUnique({ where: { id: attributeId } });
        if (!attribute) {
            throw new AppError_1.default(404, "Attribute not found");
        }
        await this.categoryRepository.removeCategoryAttribute(categoryId, attributeId);
    }
}
exports.CategoryService = CategoryService;
