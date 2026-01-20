"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const NotFoundError_1 = __importDefault(require("@/shared/errors/NotFoundError"));
const logs_factory_1 = require("../logs/logs.factory");
class AddressController {
    constructor(addressService) {
        this.addressService = addressService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.getUserAddresses = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new NotFoundError_1.default("User");
            }
            const addresses = await this.addressService.getUserAddresses(userId);
            (0, sendResponse_1.default)(res, 200, {
                data: addresses,
                message: "Addresses retrieved successfully",
            });
        });
        this.getAddressDetails = (0, asyncHandler_1.default)(async (req, res) => {
            const { addressId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new NotFoundError_1.default("User");
            }
            const address = await this.addressService.getAddressDetails(addressId, userId);
            (0, sendResponse_1.default)(res, 200, {
                data: address,
                message: "Address details retrieved successfully",
            });
        });
        this.deleteAddress = (0, asyncHandler_1.default)(async (req, res) => {
            const { addressId } = req.params;
            await this.addressService.deleteAddress(addressId);
            (0, sendResponse_1.default)(res, 200, { message: "Address deleted successfully" });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Address deleted", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
    }
}
exports.AddressController = AddressController;
