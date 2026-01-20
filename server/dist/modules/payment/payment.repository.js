"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class PaymentRepository {
    async createPayment(data) {
        return database_config_1.default.payment.create({
            data: {
                orderId: data.orderId,
                userId: data.userId,
                method: data.method,
                amount: data.amount,
                status: data.status,
            },
        });
    }
    async findPaymentsByUserId(userId) {
        return database_config_1.default.payment.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async findPaymentById(paymentId) {
        return database_config_1.default.payment.findUnique({
            where: { id: paymentId },
        });
    }
    async deletePayment(paymentId) {
        return database_config_1.default.payment.delete({
            where: { id: paymentId },
        });
    }
}
exports.PaymentRepository = PaymentRepository;
