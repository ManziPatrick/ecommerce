"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripeInstance = null;
if (stripeKey && stripeKey.startsWith("sk_")) {
    stripeInstance = new stripe_1.default(stripeKey, {
        apiVersion: "2025-08-27.basil",
    });
    console.log("✅ Stripe initialized successfully");
}
else {
    console.warn("⚠️  Stripe disabled - missing or invalid key");
    console.warn("💡 Add to .env: STRIPE_SECRET_KEY=sk_test_your_key");
}
// Helper function to get stripe with null check
const getStripe = () => {
    if (!stripeInstance) {
        throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to .env file.");
    }
    return stripeInstance;
};
exports.getStripe = getStripe;
exports.default = stripeInstance;
