"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackService = void 0;
const axios_1 = __importDefault(require("axios"));
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
class PaystackService {
    constructor() {
        this.baseUrl = "https://api.paystack.co";
        this.secretKey = process.env.PAYSTACK_SECRET_KEY || "";
        if (!this.secretKey) {
            console.warn("⚠️ Paystack secret key is missing. Add PAYSTACK_SECRET_KEY to .env");
        }
    }
    get headers() {
        return {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
        };
    }
    async initializeTransaction(params) {
        if (!this.secretKey) {
            throw new AppError_1.default(500, "Paystack is not configured");
        }
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/transaction/initialize`, params, { headers: this.headers });
            if (!response.data.status) {
                throw new AppError_1.default(400, `Paystack error: ${response.data.message}`);
            }
            return response.data.data;
        }
        catch (error) {
            console.error("Paystack initialization error:", error.response?.data || error.message);
            throw new AppError_1.default(502, "Failed to initialize Paystack transaction");
        }
    }
    async verifyTransaction(reference) {
        if (!this.secretKey) {
            throw new AppError_1.default(500, "Paystack is not configured");
        }
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/transaction/verify/${reference}`, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error("Paystack verification error:", error.response?.data || error.message);
            throw new AppError_1.default(502, "Failed to verify Paystack transaction");
        }
    }
}
exports.paystackService = new PaystackService();
exports.default = PaystackService;
