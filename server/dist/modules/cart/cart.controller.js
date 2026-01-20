"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const logs_factory_1 = require("../logs/logs.factory");
class CartController {
    constructor(cartService) {
        this.cartService = cartService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.getCart = (0, asyncHandler_1.default)(async (req, res) => {
            console.log("🔍 [CART CONTROLLER] getCart called");
            console.log("🔍 [CART CONTROLLER] Request user:", req.user);
            console.log("🔍 [CART CONTROLLER] Request session:", req.session);
            console.log("🔍 [CART CONTROLLER] Session ID:", req.session?.id);
            const userId = req.user?.id;
            const sessionId = req.session.id;
            console.log("🔍 [CART CONTROLLER] Extracted userId:", userId);
            console.log("🔍 [CART CONTROLLER] Extracted sessionId:", sessionId);
            const cart = await this.cartService.getOrCreateCart(userId, sessionId);
            console.log("🔍 [CART CONTROLLER] Cart returned from service:", cart);
            console.log("🔍 [CART CONTROLLER] Cart ID:", cart?.id);
            console.log("🔍 [CART CONTROLLER] Cart items count:", cart?.cartItems?.length);
            console.log("🔍 [CART CONTROLLER] Cart items:", cart?.cartItems);
            (0, sendResponse_1.default)(res, 200, {
                data: { cart },
                message: "Cart fetched successfully",
            });
            this.logsService.info("Cart fetched", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: Date.now() - Date.now(),
            });
        });
        this.getCartCount = (0, asyncHandler_1.default)(async (req, res) => {
            console.log("🔍 [CART CONTROLLER] getCartCount called");
            console.log("🔍 [CART CONTROLLER] Request user:", req.user);
            console.log("🔍 [CART CONTROLLER] Request session:", req.session);
            const userId = req.user?.id;
            const sessionId = req.session.id;
            console.log("🔍 [CART CONTROLLER] Extracted userId:", userId);
            console.log("🔍 [CART CONTROLLER] Extracted sessionId:", sessionId);
            const cartCount = await this.cartService.getCartCount(userId, sessionId);
            console.log("🔍 [CART CONTROLLER] Cart count returned:", cartCount);
            (0, sendResponse_1.default)(res, 200, {
                data: { cartCount },
                message: "Cart count fetched successfully",
            });
        });
        this.addToCart = (0, asyncHandler_1.default)(async (req, res) => {
            console.log("🔍 [CART CONTROLLER] addToCart called");
            console.log("🔍 [CART CONTROLLER] Request body:", req.body);
            console.log("🔍 [CART CONTROLLER] Request user:", req.user);
            console.log("🔍 [CART CONTROLLER] Request session:", req.session);
            const userId = req.user?.id;
            const sessionId = req.session.id;
            const { variantId, quantity } = req.body;
            console.log("🔍 [CART CONTROLLER] Extracted userId:", userId);
            console.log("🔍 [CART CONTROLLER] Extracted sessionId:", sessionId);
            console.log("🔍 [CART CONTROLLER] Extracted variantId:", variantId);
            console.log("🔍 [CART CONTROLLER] Extracted quantity:", quantity);
            const item = await this.cartService.addToCart(variantId, quantity, userId, sessionId);
            console.log("🔍 [CART CONTROLLER] Item returned from service:", item);
            console.log("🔍 [CART CONTROLLER] Item ID:", item?.id);
            console.log("🔍 [CART CONTROLLER] Item cartId:", item?.cartId);
            (0, sendResponse_1.default)(res, 200, {
                data: { item },
                message: "Item added to cart successfully",
            });
            this.logsService.info("Item added to cart", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: Date.now() - Date.now(),
            });
        });
        this.updateCartItem = (0, asyncHandler_1.default)(async (req, res) => {
            console.log("🔍 [CART CONTROLLER] updateCartItem called");
            console.log("🔍 [CART CONTROLLER] Request params:", req.params);
            console.log("🔍 [CART CONTROLLER] Request body:", req.body);
            const { itemId } = req.params;
            const { quantity } = req.body;
            console.log("🔍 [CART CONTROLLER] Extracted itemId:", itemId);
            console.log("🔍 [CART CONTROLLER] Extracted quantity:", quantity);
            const updatedItem = await this.cartService.updateCartItemQuantity(itemId, quantity);
            console.log("🔍 [CART CONTROLLER] Updated item returned:", updatedItem);
            (0, sendResponse_1.default)(res, 200, {
                data: { item: updatedItem },
                message: "Item quantity updated successfully",
            });
            this.logsService.info("Item quantity updated", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: Date.now() - Date.now(),
            });
        });
        this.removeFromCart = (0, asyncHandler_1.default)(async (req, res) => {
            console.log("🔍 [CART CONTROLLER] removeFromCart called");
            console.log("🔍 [CART CONTROLLER] Request params:", req.params);
            const { itemId } = req.params;
            console.log("🔍 [CART CONTROLLER] Extracted itemId:", itemId);
            const result = await this.cartService.removeFromCart(itemId);
            console.log("🔍 [CART CONTROLLER] Remove result:", result);
            (0, sendResponse_1.default)(res, 200, {
                message: "Item removed from cart successfully",
            });
            this.logsService.info("Item removed from cart", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: Date.now() - Date.now(),
            });
        });
        this.mergeCarts = (0, asyncHandler_1.default)(async (req, res) => {
            const sessionId = req.session.id;
            const userId = req.user?.id;
            await this.cartService.mergeCartsOnLogin(sessionId, userId);
            (0, sendResponse_1.default)(res, 200, { message: "Carts merged successfully" });
            this.logsService.info("Carts merged", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: Date.now() - Date.now(),
            });
        });
    }
}
exports.CartController = CartController;
