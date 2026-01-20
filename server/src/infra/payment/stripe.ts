import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

let stripeInstance: Stripe | null = null;

if (stripeKey && stripeKey.startsWith("sk_")) {
  stripeInstance = new Stripe(stripeKey, {
    apiVersion: "2025-08-27.basil",
  });
  console.log("✅ Stripe initialized successfully");
} else {
  console.warn("⚠️  Stripe disabled - missing or invalid key");
  console.warn("💡 Add to .env: STRIPE_SECRET_KEY=sk_test_your_key");
}

// Helper function to get stripe with null check
export const getStripe = (): Stripe => {
  if (!stripeInstance) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to .env file.");
  }
  return stripeInstance;
};

export default stripeInstance;
