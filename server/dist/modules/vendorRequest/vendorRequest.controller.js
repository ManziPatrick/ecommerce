"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRequestController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const client_1 = require("@prisma/client");
class VendorRequestController {
    constructor(vendorRequestService) {
        this.vendorRequestService = vendorRequestService;
        this.submitRequest = (0, asyncHandler_1.default)(async (req, res) => {
            const { shopName, shopDescription, shopEmail, phone, country, city, village, street, placeName, latitude, longitude, } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new Error("User not authenticated");
            }
            const request = await this.vendorRequestService.submitRequest(userId, {
                shopName,
                shopDescription,
                shopEmail,
                phone,
                country,
                city,
                village,
                street,
                placeName,
                latitude,
                longitude,
            });
            (0, sendResponse_1.default)(res, 201, {
                data: { request },
                message: "Vendor request submitted successfully",
            });
        });
        this.getAllRequests = (0, asyncHandler_1.default)(async (req, res) => {
            const { requests, totalResults, totalPages, currentPage } = await this.vendorRequestService.getAllRequests(req.query);
            (0, sendResponse_1.default)(res, 200, {
                data: { requests, totalResults, totalPages, currentPage },
                message: "Vendor requests fetched successfully",
            });
        });
        this.updateRequestStatus = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            const { status, adminNotes } = req.body;
            if (!Object.values(client_1.VENDOR_REQUEST_STATUS).includes(status)) {
                throw new Error("Invalid status");
            }
            const request = await this.vendorRequestService.updateRequestStatus(id, status, adminNotes);
            (0, sendResponse_1.default)(res, 200, {
                data: { request },
                message: `Vendor request ${status.toLowerCase()} successfully`,
            });
        });
    }
}
exports.VendorRequestController = VendorRequestController;
