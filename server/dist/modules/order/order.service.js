"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class OrderService {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async getAllOrders(userId, userRole) {
        let shopId;
        if (userRole === "VENDOR") {
            const shop = await database_config_1.default.shop.findFirst({ where: { ownerId: userId } });
            if (shop)
                shopId = shop.id;
        }
        const orders = await this.orderRepository.findAllOrders(shopId);
        if (!orders) {
            return [];
        }
        return orders;
    }
    async getUserOrders(userId) {
        const orders = await this.orderRepository.findOrdersByUserId(userId);
        if (!orders) {
            return [];
        }
        return orders;
    }
    async getOrderDetails(orderId, userId, userRole) {
        const order = await this.orderRepository.findOrderById(orderId);
        if (!order) {
            throw new AppError_1.default(404, "Order not found");
        }
        // Allow admins and superadmins to view any order
        const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";
        if (!isAdmin && order.userId !== userId) {
            throw new AppError_1.default(403, "You are not authorized to view this order");
        }
        return order;
    }
    async createOrderFromCart(userId, cartId) {
        const cart = await database_config_1.default.cart.findUnique({
            where: { id: cartId },
            include: { cartItems: { include: { variant: { include: { product: true } } } } },
        });
        if (!cart || cart.cartItems.length === 0) {
            throw new AppError_1.default(400, "Cart is empty or not found");
        }
        if (cart.userId !== userId) {
            throw new AppError_1.default(403, "You are not authorized to access this cart");
        }
        const amount = cart.cartItems.reduce((sum, item) => sum + item.quantity * item.variant.price, 0);
        const order = await this.orderRepository.createOrder({
            userId,
            amount,
            orderItems: cart.cartItems.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.variant.price,
                shopId: item.variant.product.shopId || undefined,
            })),
            cartId,
        });
        return order;
    }
    async updateOrderStatus(orderId, status, userId, userRole) {
        const order = await this.orderRepository.findOrderById(orderId);
        if (!order) {
            throw new AppError_1.default(404, "Order not found");
        }
        // Authorization check
        const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";
        if (!isAdmin) {
            if (userRole === "VENDOR") {
                const shop = await database_config_1.default.shop.findFirst({ where: { ownerId: userId } });
                if (!shop) {
                    throw new AppError_1.default(403, "Vendor shop not found");
                }
                // Check if any item in the order belongs to this vendor's shop
                const orderItems = await database_config_1.default.orderItem.findMany({
                    where: { orderId, shopId: shop.id }
                });
                if (orderItems.length === 0) {
                    throw new AppError_1.default(403, "You are not authorized to update this order");
                }
            }
            else {
                throw new AppError_1.default(403, "You are not authorized to perform this action");
            }
        }
        const updatedOrder = await database_config_1.default.order.update({
            where: { id: orderId },
            data: { status },
            include: { orderItems: { include: { variant: { include: { product: true } } } } },
        });
        return updatedOrder;
    }
    async requestReturn(orderId, userId, reason) {
        const order = await database_config_1.default.order.findUnique({
            where: { id: orderId },
            include: {
                shipment: true,
                returnRequest: true,
                user: true,
            },
        });
        if (!order) {
            throw new AppError_1.default(404, "Order not found");
        }
        if (order.userId !== userId) {
            throw new AppError_1.default(403, "You are not authorized to return this order");
        }
        if (order.status !== "DELIVERED") {
            throw new AppError_1.default(400, "Only delivered orders can be returned");
        }
        if (order.returnRequest) {
            throw new AppError_1.default(400, "A return request already exists for this order");
        }
        // Check 4-hour window
        if (!order.shipment?.deliveryDate) {
            throw new AppError_1.default(400, "Delivery date not found. Cannot verify return window.");
        }
        const deliveryTime = new Date(order.shipment.deliveryDate).getTime();
        const currentTime = Date.now();
        const hoursDifference = (currentTime - deliveryTime) / (1000 * 60 * 60);
        if (hoursDifference > 4) {
            throw new AppError_1.default(400, "Return period exceeded (4 hours from delivery)");
        }
        const returnRequest = await database_config_1.default.returnRequest.create({
            data: {
                orderId,
                userId,
                reason,
            },
            include: { order: true },
        });
        // Update order status
        await database_config_1.default.order.update({
            where: { id: orderId },
            data: { status: "RETURN_REQUESTED" }
        });
        return returnRequest;
    }
}
exports.OrderService = OrderService;
