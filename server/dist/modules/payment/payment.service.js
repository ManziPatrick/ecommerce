"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
class PaymentService {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    async getUserPayments(userId) {
        const payments = await this.paymentRepository.findPaymentsByUserId(userId);
        if (!payments || payments.length === 0) {
            throw new AppError_1.default(404, "No payments found for this user");
        }
        return payments;
    }
    async getPaymentDetails(paymentId, userId) {
        const payment = await this.paymentRepository.findPaymentById(paymentId);
        if (!payment) {
            throw new AppError_1.default(404, "Payment not found");
        }
        if (payment.userId !== userId) {
            throw new AppError_1.default(403, "You are not authorized to view this payment");
        }
        return payment;
    }
    async deletePayment(paymentId) {
        const payment = await this.paymentRepository.findPaymentById(paymentId);
        if (!payment) {
            throw new AppError_1.default(404, "Payment not found");
        }
        return this.paymentRepository.deletePayment(paymentId);
    }
    async verifyDPOPayment(transToken) {
        const { dpoService } = await Promise.resolve().then(() => __importStar(require("@/infra/payment/dpo")));
        const result = await dpoService.verifyToken(transToken);
        // Here you would typically look up the transaction in your DB by TransToken or Ref
        // and update the status. For now, we return the result.
        return result;
    }
}
exports.PaymentService = PaymentService;
