"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const slugify_1 = __importDefault(require("@/shared/utils/slugify"));
const logs_factory_1 = require("../logs/logs.factory");
const uploadToCloudinary_1 = require("@/shared/utils/uploadToCloudinary");
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class ProductController {
    constructor(productService) {
        this.productService = productService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.getAllProducts = (0, asyncHandler_1.default)(async (req, res) => {
            const queryString = { ...req.query };
            // If user is a VENDOR, filter by their shopId
            if (req.user?.role === "VENDOR") {
                const shop = await database_config_1.default.shop.findFirst({ where: { ownerId: req.user.id } });
                if (shop) {
                    queryString.shopId = shop.id;
                }
                else {
                    // If vendor has no shop, return no products
                    queryString.shopId = "none";
                }
            }
            const { products, totalResults, totalPages, currentPage, resultsPerPage, } = await this.productService.getAllProducts(queryString);
            (0, sendResponse_1.default)(res, 200, {
                data: {
                    products,
                    totalResults,
                    totalPages,
                    currentPage,
                    resultsPerPage,
                },
                message: "Products fetched successfully",
            });
        });
        this.getProductById = (0, asyncHandler_1.default)(async (req, res) => {
            const { id: productId } = req.params;
            const product = await this.productService.getProductById(productId);
            (0, sendResponse_1.default)(res, 200, {
                data: product,
                message: "Product fetched successfully",
            });
        });
        this.getProductBySlug = (0, asyncHandler_1.default)(async (req, res) => {
            const { slug: productSlug } = req.params;
            const product = await this.productService.getProductBySlug(productSlug);
            (0, sendResponse_1.default)(res, 200, {
                data: product,
                message: "Product fetched successfully",
            });
        });
        this.createProduct = (0, asyncHandler_1.default)(async (req, res) => {
            const { name, description, isNew, isTrending, isBestSeller, isFeatured, categoryId, variants: rawVariants, } = req.body;
            // Log for debugging
            console.log("req.body:", JSON.stringify(req.body, null, 2), "req.files:", req.files);
            // Validate variants
            const variants = rawVariants || [];
            if (!Array.isArray(variants) || variants.length === 0) {
                throw new AppError_1.default(400, "At least one variant is required");
            }
            // Upload images to Cloudinary
            const files = req.files || [];
            let imageResults = [];
            if (files.length > 0) {
                try {
                    imageResults = await (0, uploadToCloudinary_1.uploadToCloudinary)(files);
                    if (imageResults.length === 0) {
                        throw new AppError_1.default(400, "Failed to upload images to Cloudinary");
                    }
                }
                catch (error) {
                    console.error("Cloudinary upload error:", error);
                    throw new AppError_1.default(400, "Failed to upload images to Cloudinary");
                }
            }
            // Process variants
            const processedVariants = variants.map((variant, index) => {
                // Parse JSON fields
                let attributes = [];
                let imageIndexes = [];
                try {
                    attributes = JSON.parse(variant.attributes || "[]");
                    imageIndexes = JSON.parse(variant.imageIndexes || "[]");
                }
                catch (error) {
                    console.error(`Error parsing JSON for variant ${index}:`, error);
                    throw new AppError_1.default(400, `Invalid JSON format in variant ${index}`);
                }
                // Map image URLs based on imageIndexes
                const imageUrls = imageIndexes
                    .map((idx) => {
                    if (idx >= 0 && idx < imageResults.length) {
                        return imageResults[idx].url;
                    }
                    console.warn(`Invalid image index ${idx} for variant ${index}`);
                    return null;
                })
                    .filter((url) => url !== null);
                return {
                    ...variant,
                    price: parseFloat(variant.price),
                    discountPrice: variant.discountPrice ? parseFloat(variant.discountPrice) : undefined,
                    stock: parseInt(variant.stock, 10),
                    lowStockThreshold: parseInt(variant.lowStockThreshold || "10", 10),
                    attributes,
                    images: imageUrls,
                };
            });
            // Create product
            const product = await this.productService.createProduct({
                name,
                description,
                isNew: isNew === "true",
                isTrending: isTrending === "true",
                isBestSeller: isBestSeller === "true",
                isFeatured: isFeatured === "true",
                categoryId,
                shopId: req.body.shopId,
                variants: processedVariants,
            }, req.user?.id, req.user?.role);
            // Send response
            res.status(201).json({
                status: "success",
                data: { product },
                message: "Product created successfully",
            });
        });
        this.updateProduct = (0, asyncHandler_1.default)(async (req, res) => {
            const { id: productId } = req.params;
            const { name, description, categoryId, isNew, isFeatured, isTrending, isBestSeller, } = req.body;
            console.log("req.body:", req.body, "req.files:", req.files);
            // Parse variants from req.body
            let parsedVariants = [];
            for (const key in req.body) {
                if (key.startsWith("variants[")) {
                    const match = key.match(/^variants\[(\d+)\]\[(\w+)\]$/);
                    if (match) {
                        const index = parseInt(match[1]);
                        const field = match[2];
                        if (!parsedVariants[index]) {
                            parsedVariants[index] = {};
                        }
                        parsedVariants[index][field] = req.body[key];
                    }
                }
            }
            parsedVariants = parsedVariants.filter(Boolean);
            // Process files for each variant
            const files = req.files || [];
            const processedVariants = parsedVariants.length
                ? await Promise.all(parsedVariants.map(async (variant, index) => {
                    // Try to get files from imageIndexes or variants[${index}][images][${fileIndex}]
                    let variantFiles = [];
                    let imageIndexes = [];
                    try {
                        imageIndexes = variant.imageIndexes
                            ? JSON.parse(variant.imageIndexes)
                            : [];
                        if (Array.isArray(imageIndexes)) {
                            variantFiles = imageIndexes
                                .map((idx) => files.find((f) => f.fieldname === `images` && files.indexOf(f) === idx))
                                .filter(Boolean);
                        }
                    }
                    catch {
                        // Fallback to old format
                        variantFiles = files.filter((f) => f.fieldname.startsWith(`variants[${index}][images][`));
                    }
                    // Upload files to Cloudinary
                    let imageUrls = [];
                    if (variantFiles.length > 0) {
                        const uploadedImages = await (0, uploadToCloudinary_1.uploadToCloudinary)(variantFiles);
                        imageUrls = uploadedImages
                            .map((img) => img.url)
                            .filter(Boolean);
                    }
                    // Validate images from req.body
                    let bodyImages = variant.images || [];
                    if (typeof bodyImages === "string") {
                        try {
                            bodyImages = JSON.parse(bodyImages);
                        }
                        catch {
                            throw new AppError_1.default(400, `Invalid images format at variant index ${index}`);
                        }
                    }
                    if (!Array.isArray(bodyImages) ||
                        bodyImages.some((img) => img && typeof img !== "string")) {
                        throw new AppError_1.default(400, `Images at variant index ${index} must be an array of strings or empty`);
                    }
                    // Combine uploaded images with body images
                    imageUrls = [
                        ...imageUrls,
                        ...bodyImages.filter((img) => img),
                    ];
                    // Validate other fields
                    if (!variant.sku ||
                        typeof variant.price !== "number" ||
                        typeof variant.stock !== "number") {
                        throw new AppError_1.default(400, `Variant at index ${index} must have sku, price, and stock`);
                    }
                    if (variant.discountPrice !== undefined && typeof variant.discountPrice !== "number") {
                        throw new AppError_1.default(400, `Variant at index ${index} discountPrice must be a number`);
                    }
                    if (variant.stock < 0) {
                        throw new AppError_1.default(400, `Variant at index ${index} must have a valid non-negative stock number`);
                    }
                    // Validate attributes
                    let parsedAttributes;
                    try {
                        parsedAttributes =
                            typeof variant.attributes === "string"
                                ? JSON.parse(variant.attributes)
                                : variant.attributes;
                        if (!Array.isArray(parsedAttributes)) {
                            throw new AppError_1.default(400, `Variant at index ${index} must have an attributes array`);
                        }
                        parsedAttributes.forEach((attr, attrIndex) => {
                            if (!attr.attributeId || !attr.valueId) {
                                throw new AppError_1.default(400, `Invalid attribute structure in variant at index ${index}, attribute index ${attrIndex}`);
                            }
                        });
                    }
                    catch (error) {
                        throw new AppError_1.default(400, `Invalid attributes format at index ${index}`);
                    }
                    // Check for duplicate attributes
                    const attributeIds = parsedAttributes.map((attr) => attr.attributeId);
                    if (new Set(attributeIds).size !== attributeIds.length) {
                        throw new AppError_1.default(400, `Duplicate attributes in variant at index ${index}`);
                    }
                    return {
                        ...variant,
                        images: imageUrls,
                        attributes: parsedAttributes,
                    };
                }))
                : undefined;
            if (processedVariants) {
                // Check for duplicate SKUs
                const skuKeys = processedVariants.map((variant) => variant.sku);
                if (new Set(skuKeys).size !== skuKeys.length) {
                    throw new AppError_1.default(400, "Duplicate SKUs detected");
                }
                // Check for duplicate attribute combinations
                const comboKeys = processedVariants.map((variant) => variant.attributes
                    .map((attr) => `${attr.attributeId}:${attr.valueId}`)
                    .sort()
                    .join("|"));
                if (new Set(comboKeys).size !== comboKeys.length) {
                    throw new AppError_1.default(400, "Duplicate attribute combinations detected");
                }
            }
            const updatedData = {
                ...(name && { name, slug: (0, slugify_1.default)(name) }),
                ...(description && { description }),
                ...(isNew !== undefined && { isNew: isNew === "true" }),
                ...(isFeatured !== undefined && { isFeatured: isFeatured === "true" }),
                ...(isTrending !== undefined && { isTrending: isTrending === "true" }),
                ...(isBestSeller !== undefined && {
                    isBestSeller: isBestSeller === "true",
                }),
                ...(categoryId && { categoryId }),
                ...(processedVariants && { variants: processedVariants }),
            };
            const product = await this.productService.updateProduct(productId, updatedData, req.user?.id, req.user?.role);
            (0, sendResponse_1.default)(res, 200, {
                data: { product },
                message: "Product updated successfully",
            });
            this.logsService.info("Product updated", {
                userId: req.user?.id,
                sessionId: req.session.id,
            });
        });
        this.bulkCreateProducts = (0, asyncHandler_1.default)(async (req, res) => {
            const file = req.file;
            const result = await this.productService.bulkCreateProducts(file, req.user?.id, req.user?.role);
            (0, sendResponse_1.default)(res, 201, {
                data: { count: result.count },
                message: `${result.count} products created successfully`,
            });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Bulk Products created", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.deleteProduct = (0, asyncHandler_1.default)(async (req, res) => {
            const { id: productId } = req.params;
            await this.productService.deleteProduct(productId, req.user?.id, req.user?.role);
            (0, sendResponse_1.default)(res, 200, { message: "Product deleted successfully" });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Product deleted", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
    }
}
exports.ProductController = ProductController;
