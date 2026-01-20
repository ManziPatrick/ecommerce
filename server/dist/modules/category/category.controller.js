"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const logs_factory_1 = require("../logs/logs.factory");
const uploadToCloudinary_1 = require("@/shared/utils/uploadToCloudinary");
const slugify_1 = __importDefault(require("@/shared/utils/slugify"));
class CategoryController {
    constructor(categoryService) {
        this.categoryService = categoryService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.getAllCategories = (0, asyncHandler_1.default)(async (req, res) => {
            const { categories, totalResults, totalPages, currentPage, resultsPerPage, } = await this.categoryService.getAllCategories(req.query);
            (0, sendResponse_1.default)(res, 200, {
                data: {
                    categories,
                    totalResults,
                    totalPages,
                    currentPage,
                    resultsPerPage,
                },
                message: "Categories fetched successfully",
            });
        });
        this.getCategory = (0, asyncHandler_1.default)(async (req, res) => {
            const { id: categoryId } = req.params;
            const category = await this.categoryService.getCategory(categoryId);
            (0, sendResponse_1.default)(res, 200, {
                data: { category },
                message: "Category fetched successfully",
            });
        });
        this.createCategory = (0, asyncHandler_1.default)(async (req, res) => {
            const { name, description } = req.body;
            const slugifiedName = (0, slugify_1.default)(name);
            const files = req.files;
            let imageUrls = [];
            if (Array.isArray(files) && files.length > 0) {
                const uploadedImages = await (0, uploadToCloudinary_1.uploadToCloudinary)(files);
                imageUrls = uploadedImages.map((img) => img.url).filter(Boolean);
            }
            const { category } = await this.categoryService.createCategory({
                name,
                description,
                images: imageUrls.length > 0 ? imageUrls : undefined,
            });
            (0, sendResponse_1.default)(res, 201, {
                data: { category },
                message: "Category created successfully",
            });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Category created", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.deleteCategory = (0, asyncHandler_1.default)(async (req, res) => {
            const { id: categoryId } = req.params;
            await this.categoryService.deleteCategory(categoryId);
            (0, sendResponse_1.default)(res, 204, { message: "Category deleted successfully" });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Category deleted", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
    }
}
exports.CategoryController = CategoryController;
