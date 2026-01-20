"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRequestService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const slugify_1 = __importDefault(require("@/shared/utils/slugify"));
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
const ApiFeatures_1 = __importDefault(require("@/shared/utils/ApiFeatures"));
const client_1 = require("@prisma/client");
class VendorRequestService {
    constructor(vendorRequestRepository, shopRepository) {
        this.vendorRequestRepository = vendorRequestRepository;
        this.shopRepository = shopRepository;
    }
    async submitRequest(userId, data) {
        // Check if user already has a pending request
        const existingRequest = await this.vendorRequestRepository.findRequestByUserId(userId);
        if (existingRequest) {
            throw new AppError_1.default(400, "You already have a pending vendor request");
        }
        // Check if user is already a vendor
        const user = await database_config_1.default.user.findUnique({ where: { id: userId } });
        if (user?.role === "VENDOR") {
            throw new AppError_1.default(400, "You are already a vendor");
        }
        return this.vendorRequestRepository.createVendorRequest({
            userId,
            ...data
        });
    }
    async getAllRequests(queryString) {
        const apiFeatures = new ApiFeatures_1.default(queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            .build();
        const { where, orderBy, skip, take } = apiFeatures;
        const requests = await this.vendorRequestRepository.findVendorRequests({
            where,
            orderBy,
            skip,
            take,
        });
        const totalResults = await this.vendorRequestRepository.countVendorRequests(where);
        const totalPages = Math.ceil(totalResults / take);
        return {
            requests,
            totalResults,
            totalPages,
            currentPage: Math.floor(skip / take) + 1,
        };
    }
    async updateRequestStatus(requestId, status, adminNotes) {
        const request = await this.vendorRequestRepository.findVendorRequestById(requestId);
        if (!request) {
            throw new AppError_1.default(404, "Vendor request not found");
        }
        if (request.status !== client_1.VENDOR_REQUEST_STATUS.PENDING) {
            throw new AppError_1.default(400, "Request has already been processed");
        }
        const updatedRequest = await this.vendorRequestRepository.updateVendorRequest(requestId, {
            status,
            adminNotes,
        });
        if (status === client_1.VENDOR_REQUEST_STATUS.APPROVED) {
            // 1. Upgrade user role
            await database_config_1.default.user.update({
                where: { id: request.userId },
                data: { role: "VENDOR" },
            });
            // 2. Create shop
            const slug = (0, slugify_1.default)(request.shopName);
            // Ensure slug is unique
            const existingShop = await this.shopRepository.findShopBySlug(slug);
            let finalSlug = slug;
            if (existingShop) {
                finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;
            }
            await this.shopRepository.createShop({
                name: request.shopName,
                slug: finalSlug,
                description: request.shopDescription,
                email: request.shopEmail || undefined,
                phone: request.phone || undefined,
                country: request.country || undefined,
                city: request.city || undefined,
                village: request.village || undefined,
                street: request.street || undefined,
                placeName: request.placeName || undefined,
                latitude: request.latitude || undefined,
                longitude: request.longitude || undefined,
                ownerId: request.userId,
            });
        }
        return updatedRequest;
    }
}
exports.VendorRequestService = VendorRequestService;
