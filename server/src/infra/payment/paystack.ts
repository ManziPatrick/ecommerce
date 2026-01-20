import axios from "axios";
import AppError from "@/shared/errors/AppError";

interface InitializeTransactionParams {
    email: string;
    amount: number; // in kobo/cents (lowest currency unit)
    currency?: string;
    callback_url?: string;
    metadata?: any;
    channels?: string[]; // e.g. ['card', 'mobile_money']
}

interface InitializeTransactionResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

class PaystackService {
    private secretKey: string;
    private baseUrl: string = "https://api.paystack.co";

    constructor() {
        this.secretKey = process.env.PAYSTACK_SECRET_KEY || "";
        if (!this.secretKey) {
            console.warn("⚠️ Paystack secret key is missing. Add PAYSTACK_SECRET_KEY to .env");
        }
    }

    private get headers() {
        return {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
        };
    }

    async initializeTransaction(params: InitializeTransactionParams): Promise<InitializeTransactionResponse["data"]> {
        if (!this.secretKey) {
            throw new AppError(500, "Paystack is not configured");
        }

        try {
            const response = await axios.post<InitializeTransactionResponse>(
                `${this.baseUrl}/transaction/initialize`,
                params,
                { headers: this.headers }
            );

            if (!response.data.status) {
                throw new AppError(400, `Paystack error: ${response.data.message}`);
            }

            return response.data.data;
        } catch (error: any) {
            console.error("Paystack initialization error:", error.response?.data || error.message);
            throw new AppError(502, "Failed to initialize Paystack transaction");
        }
    }

    async verifyTransaction(reference: string) {
        if (!this.secretKey) {
            throw new AppError(500, "Paystack is not configured");
        }

        try {
            const response = await axios.get(
                `${this.baseUrl}/transaction/verify/${reference}`,
                { headers: this.headers }
            );

            return response.data;
        } catch (error: any) {
            console.error("Paystack verification error:", error.response?.data || error.message);
            throw new AppError(502, "Failed to verify Paystack transaction");
        }
    }
}

export const paystackService = new PaystackService();
export default PaystackService;
