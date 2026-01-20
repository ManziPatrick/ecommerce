import axios from "axios";
import { Builder, parseStringPromise } from "xml2js";
import AppError from "@/shared/errors/AppError";

interface CreateTokenParams {
    amount: number;
    currency: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string; // Important for MoMo
    description: string;
    metadata?: any;
    callbackUrl?: string;
}

interface ChargeMobileParams {
    transactionToken: string;
    phoneNumber: string;
    mno: string; // e.g., "mtn", "airtel"
    mnoCountry: string; // e.g., "rw", "tz"
}

export class DPOPaymentService {
    private companyToken: string;
    private serviceType: string;
    private baseUrl: string;

    constructor() {
        this.companyToken = process.env.DPO_COMPANY_TOKEN || "";
        this.serviceType = process.env.DPO_SERVICE_TYPE || "";
        // User requested full integration with production URL
        this.baseUrl = "https://secure.3gdirectpay.com/API/v6/";

        if (!this.companyToken || !this.serviceType) {
            console.warn("⚠️ DPO credentials missing. Add DPO_COMPANY_TOKEN and DPO_SERVICE_TYPE to .env");
        }
    }

    private buildXml(requestData: any): string {
        const builder = new Builder({ rootName: "API3G" });
        return builder.buildObject({
            CompanyToken: this.companyToken,
            ...requestData,
        });
    }

    private async parseXml(xml: string): Promise<any> {
        try {
            const result = await parseStringPromise(xml, { explicitArray: false });
            return result.API3G || result;
        } catch (error) {
            throw new Error("Failed to parse DPO response");
        }
    }

    async createToken(params: CreateTokenParams) {
        if (!this.companyToken) {
            throw new AppError(500, "DPO is not configured");
        }

        const payload = {
            Request: "createToken",
            Transaction: {
                PaymentAmount: params.amount,
                PaymentCurrency: params.currency,
                CompanyRef: params.metadata?.orderId || `REF-${Date.now()}`,
                RedirectURL: params.callbackUrl || "http://localhost:3000/orders",
                BackURL: params.callbackUrl || "http://localhost:3000/cart",
                CompanyRefUnique: 0,
                PTL: 5, // Payment Time Limit in hours
            },
            Services: {
                Service: {
                    ServiceType: this.serviceType,
                    ServiceDescription: params.description,
                    ServiceDate: new Date().toISOString().split("T")[0] + " 00:00",
                },
            },
            // Customer details if available
            ...(params.email && { CustomerEmail: params.email }),
            ...(params.firstName && { CustomerFirstName: params.firstName }),
            ...(params.lastName && { CustomerLastName: params.lastName }),
            ...(params.phone && { CustomerPhone: params.phone }),
        };

        try {
            const xmlBody = this.buildXml(payload);
            const response = await axios.post(this.baseUrl, xmlBody, {
                headers: { "Content-Type": "application/xml" },
            });

            const result = await this.parseXml(response.data);

            if (result.Result !== "000") {
                throw new AppError(400, `DPO Error: ${result.ResultExplanation || "Unknown error"}`);
            }

            return {
                transToken: result.TransToken,
                transRef: result.TransRef,
            };
        } catch (error: any) {
            console.error("DPO createToken error:", error.response?.data || error.message);
            throw new AppError(502, "Failed to initiate DPO payment");
        }
    }

    async chargeMobile(params: ChargeMobileParams) {
        const payload = {
            Request: "chargeTokenMobile",
            TransactionToken: params.transactionToken,
            PhoneNumber: params.phoneNumber,
            MNO: params.mno,
            MNOcountry: params.mnoCountry,
        };

        try {
            const xmlBody = this.buildXml(payload);
            const response = await axios.post(this.baseUrl, xmlBody, {
                headers: { "Content-Type": "application/xml" },
            });

            const result = await this.parseXml(response.data);

            // result code 000 usually means "Instruction sent" or similar for mobile
            // Sometimes it returns pending status (900/901/etc).
            // We return the raw result for the controller to handle.
            return result;
        } catch (error: any) {
            console.error("DPO chargeMobile error:", error.response?.data || error.message);
            throw new AppError(502, "Failed to charge mobile money");
        }
    }

    async verifyToken(transToken: string) {
        const payload = {
            Request: "verifyToken",
            TransactionToken: transToken,
        };

        try {
            const xmlBody = this.buildXml(payload);
            const response = await axios.post(this.baseUrl, xmlBody, {
                headers: { "Content-Type": "application/xml" },
            });

            const result = await this.parseXml(response.data);
            return result;
        } catch (error: any) {
            console.error("DPO verifyToken error:", error.response?.data || error.message);
            throw new AppError(502, "Failed to verify DPO payment");
        }
    }
}

export const dpoService = new DPOPaymentService();
export default DPOPaymentService;
