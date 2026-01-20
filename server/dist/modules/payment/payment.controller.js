"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const logs_factory_1 = require("../logs/logs.factory");
class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.getUserPayments = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError_1.default(400, "User not found");
            }
            const payments = await this.paymentService.getUserPayments(userId);
            (0, sendResponse_1.default)(res, 200, {
                data: payments,
                message: "Payments retrieved successfully",
            });
        });
        this.getPaymentDetails = (0, asyncHandler_1.default)(async (req, res) => {
            const { paymentId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError_1.default(400, "User not found");
            }
            const payment = await this.paymentService.getPaymentDetails(paymentId, userId);
            (0, sendResponse_1.default)(res, 200, {
                data: payment,
                message: "Payment retrieved successfully",
            });
        });
        this.deletePayment = (0, asyncHandler_1.default)(async (req, res) => {
            const { paymentId } = req.params;
            await this.paymentService.deletePayment(paymentId);
            (0, sendResponse_1.default)(res, 200, { message: "Payment deleted successfully" });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Payment deleted", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.verifyDPOPayment = (0, asyncHandler_1.default)(async (req, res) => {
            const { transToken } = req.body;
            if (!transToken) {
                throw new AppError_1.default(400, "Transaction token is required");
            }
            const result = await this.paymentService.verifyDPOPayment(transToken);
            (0, sendResponse_1.default)(res, 200, {
                data: result,
                message: "Payment verified successfully",
            });
        });
    }
}
exports.PaymentController = PaymentController;
