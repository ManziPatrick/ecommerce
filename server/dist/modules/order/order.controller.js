"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
        this.getAllOrders = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            const userRole = req.user?.role;
            if (!userId) {
                throw new AppError_1.default(401, "Unauthorized");
            }
            const orders = await this.orderService.getAllOrders(userId, userRole);
            (0, sendResponse_1.default)(res, 200, {
                data: { orders },
                message: "Orders retrieved successfully",
            });
        });
        this.getUserOrders = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError_1.default(400, "User not found");
            }
            const orders = await this.orderService.getUserOrders(userId);
            (0, sendResponse_1.default)(res, 200, {
                data: { orders },
                message: "Orders retrieved successfully",
            });
        });
        this.getOrderDetails = (0, asyncHandler_1.default)(async (req, res) => {
            const { orderId } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;
            if (!userId) {
                throw new AppError_1.default(400, "User not found");
            }
            const order = await this.orderService.getOrderDetails(orderId, userId, userRole);
            (0, sendResponse_1.default)(res, 200, {
                data: { order },
                message: "Order details retrieved successfully",
            });
        });
        this.createOrder = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            const { cartId } = req.body;
            if (!userId) {
                throw new AppError_1.default(400, "User not found");
            }
            if (!cartId) {
                throw new AppError_1.default(400, "Cart ID is required");
            }
            const order = await this.orderService.createOrderFromCart(userId, cartId);
            (0, sendResponse_1.default)(res, 201, {
                data: { order },
                message: "Order created successfully",
            });
        });
        this.updateOrder = (0, asyncHandler_1.default)(async (req, res) => {
            const { orderId } = req.params;
            const { status } = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;
            if (!userId) {
                throw new AppError_1.default(401, "Unauthorized");
            }
            if (!status) {
                throw new AppError_1.default(400, "Status is required");
            }
            const order = await this.orderService.updateOrderStatus(orderId, status, userId, userRole);
            (0, sendResponse_1.default)(res, 200, {
                data: { order },
                message: "Order updated successfully",
            });
        });
        this.requestReturn = (0, asyncHandler_1.default)(async (req, res) => {
            const { orderId } = req.params;
            const { reason } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError_1.default(401, "Unauthorized");
            }
            if (!reason) {
                throw new AppError_1.default(400, "Reason is required");
            }
            const returnRequest = await this.orderService.requestReturn(orderId, userId, reason);
            (0, sendResponse_1.default)(res, 201, {
                data: { returnRequest },
                message: "Return request submitted successfully",
            });
        });
    }
}
exports.OrderController = OrderController;
