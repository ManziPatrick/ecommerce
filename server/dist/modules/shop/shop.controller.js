"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const logs_factory_1 = require("../logs/logs.factory");
const uploadToCloudinary_1 = require("@/shared/utils/uploadToCloudinary");
class ShopController {
    constructor(shopService) {
        this.shopService = shopService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.getAllShops = (0, asyncHandler_1.default)(async (req, res) => {
            const { shops, totalResults, totalPages, currentPage, resultsPerPage, } = await this.shopService.getAllShops(req.query);
            (0, sendResponse_1.default)(res, 200, {
                data: {
                    shops,
                    totalResults,
                    totalPages,
                    currentPage,
                    resultsPerPage,
                },
                message: "Shops fetched successfully",
            });
        });
        this.getShop = (0, asyncHandler_1.default)(async (req, res) => {
            const { id: shopId } = req.params;
            const shop = await this.shopService.getShop(shopId);
            (0, sendResponse_1.default)(res, 200, {
                data: { shop },
                message: "Shop fetched successfully",
            });
        });
        this.getMyShop = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error("User not authenticated");
            }
            const shop = await this.shopService.getShopByOwnerId(userId);
            (0, sendResponse_1.default)(res, 200, {
                data: { shop },
                message: "Shop fetched successfully",
            });
        });
        this.getShopBySlug = (0, asyncHandler_1.default)(async (req, res) => {
            const { slug } = req.params;
            const shop = await this.shopService.getShopBySlug(slug);
            (0, sendResponse_1.default)(res, 200, {
                data: { shop },
                message: "Shop fetched successfully",
            });
        });
        this.createShop = (0, asyncHandler_1.default)(async (req, res) => {
            const { name, description } = req.body;
            const ownerId = req.user?.id; // The person creating the shop is the owner
            if (!ownerId) {
                throw new Error("User not authenticated");
            }
            const files = req.files;
            let logoUrl;
            if (Array.isArray(files) && files.length > 0) {
                const uploadedImages = await (0, uploadToCloudinary_1.uploadToCloudinary)(files);
                logoUrl = uploadedImages[0]?.url;
            }
            const { shop } = await this.shopService.createShop({
                name,
                description,
                logo: logoUrl,
                ownerId,
            });
            (0, sendResponse_1.default)(res, 201, {
                data: { shop },
                message: "Shop created successfully",
            });
            this.logsService.info("Shop created", {
                userId: ownerId,
                shopId: shop.id,
            });
        });
        this.updateShop = (0, asyncHandler_1.default)(async (req, res) => {
            const { id: shopId } = req.params;
            const { name, description } = req.body;
            const files = req.files;
            let logoUrl;
            if (Array.isArray(files) && files.length > 0) {
                const uploadedImages = await (0, uploadToCloudinary_1.uploadToCloudinary)(files);
                logoUrl = uploadedImages[0]?.url;
            }
            const { shop } = await this.shopService.updateShop(shopId, {
                name,
                description,
                logo: logoUrl,
            });
            (0, sendResponse_1.default)(res, 200, {
                data: { shop },
                message: "Shop updated successfully",
            });
        });
        this.deleteShop = (0, asyncHandler_1.default)(async (req, res) => {
            const { id: shopId } = req.params;
            await this.shopService.deleteShop(shopId);
            (0, sendResponse_1.default)(res, 204, { message: "Shop deleted successfully" });
        });
    }
}
exports.ShopController = ShopController;
