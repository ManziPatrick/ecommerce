"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
class DiscountController {
    constructor(discountService) {
        this.discountService = discountService;
        this.createDiscount = (0, asyncHandler_1.default)(async (req, res) => {
            const discount = await this.discountService.createDiscount(req.body);
            (0, sendResponse_1.default)(res, 201, {
                data: { discount },
                message: "Discount created successfully",
            });
        });
        this.getAllDiscounts = (0, asyncHandler_1.default)(async (req, res) => {
            const discounts = await this.discountService.getAllDiscounts();
            (0, sendResponse_1.default)(res, 200, {
                data: { discounts },
                message: "Discounts retrieved successfully",
            });
        });
        this.validateDiscount = (0, asyncHandler_1.default)(async (req, res) => {
            const { code, amount } = req.body;
            const discount = await this.discountService.validateDiscount(code, amount);
            (0, sendResponse_1.default)(res, 200, {
                data: { discount },
                message: "Discount is valid",
            });
        });
        this.updateDiscount = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            const discount = await this.discountService.updateDiscount(id, req.body);
            (0, sendResponse_1.default)(res, 200, {
                data: { discount },
                message: "Discount updated successfully",
            });
        });
        this.deleteDiscount = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            await this.discountService.deleteDiscount(id);
            (0, sendResponse_1.default)(res, 204, {
                message: "Discount deleted successfully",
            });
        });
    }
}
exports.DiscountController = DiscountController;
