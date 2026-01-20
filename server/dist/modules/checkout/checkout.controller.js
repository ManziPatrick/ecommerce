"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const logs_factory_1 = require("../logs/logs.factory");
class CheckoutController {
    constructor(checkoutService, cartService) {
        this.checkoutService = checkoutService;
        this.cartService = cartService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.initiateCheckout = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                this.logsService.error("Checkout failed: User not found", { headers: req.headers });
                throw new AppError_1.default(400, "User not found");
            }
            const cart = await this.cartService.getOrCreateCart(userId);
            if (!cart.cartItems || cart.cartItems.length === 0) {
                this.logsService.error("Checkout failed: Cart is empty", { userId, cartId: cart.id });
                throw new AppError_1.default(400, "Cart is empty");
            }
            const { provider = "stripe", phoneNumber, mno, couponCode } = req.body;
            const session = await this.checkoutService.createCheckoutSession(cart, userId, provider, { phoneNumber, mno }, couponCode);
            (0, sendResponse_1.default)(res, 200, {
                data: {
                    sessionId: session.id,
                    url: session.url,
                    provider: session.provider
                },
                message: "Checkout initiated successfully",
            });
            this.cartService.logCartEvent(cart.id, "CHECKOUT_STARTED", userId);
            this.logsService.info("Checkout initiated", {
                userId,
                sessionId: session.id,
                timePeriod: 0,
            });
        });
    }
}
exports.CheckoutController = CheckoutController;
