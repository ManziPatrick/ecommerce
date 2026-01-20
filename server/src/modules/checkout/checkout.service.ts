import type Stripe from "stripe";
import stripeInstance from "@/infra/payment/stripe";
import { paystackService } from "@/infra/payment/paystack";
import { dpoService } from "@/infra/payment/dpo";

const stripe: Stripe | null = stripeInstance;

import AppError from "@/shared/errors/AppError";
import prisma from "@/infra/database/database.config";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

function safeImage(images: string[] = []): string {
  return images?.[0] || PLACEHOLDER_IMAGE;
}

function validImage(url: string): string {
  return url.length <= 2048 ? url : PLACEHOLDER_IMAGE;
}

interface PaymentDetails {
  phoneNumber?: string;
  mno?: string;
}

export class CheckoutService {
  constructor() { }

  async createCheckoutSession(
    cart: any,
    userId: string,
    provider: "stripe" | "paystack" | "dpo" = "stripe",
    paymentDetails?: PaymentDetails,
    couponCode?: string
  ) {
    // Validate stock for all cart items
    for (const item of cart.cartItems) {
      if (item.variant.stock < item.quantity) {
        console.error(`Insufficient stock for variant ${item.variant.sku}: wanted ${item.quantity}, available ${item.variant.stock}`);
        throw new AppError(
          400,
          `Insufficient stock for variant ${item.variant.sku}: only ${item.variant.stock} available`
        );
      }
    }

    const isProduction = process.env.NODE_ENV === "production";
    const clientUrl = isProduction
      ? process.env.CLIENT_URL_PROD
      : (process.env.CLIENT_URL_DEV || "http://localhost:3000");

    if (!clientUrl) {
      throw new Error("CLIENT_URL_PROD or CLIENT_URL_DEV must be set");
    }

    const email = "user@example.com"; // TODO: Get actual user email from userId/Auth

    const totalAmountBeforeDiscount = cart.cartItems.reduce((acc: number, item: any) => {
      return acc + (item.variant.price * item.quantity);
    }, 0);

    let discountAmount = 0;
    let discountId = undefined;

    if (couponCode) {
      const { makeDiscountController } = require("../discount/discount.factory");
      const discountRepository = new (require("../discount/discount.repository").DiscountRepository)();
      const discountService = new (require("../discount/discount.service").DiscountService)(discountRepository);

      try {
        const discount = await discountService.validateDiscount(couponCode, totalAmountBeforeDiscount);
        discountId = discount.id;
        if (discount.type === "PERCENTAGE") {
          discountAmount = (totalAmountBeforeDiscount * discount.value) / 100;
        } else {
          discountAmount = discount.value;
        }
        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, totalAmountBeforeDiscount);
      } catch (error: any) {
        throw new AppError(400, error.message || "Invalid coupon code");
      }
    }

    const finalAmount = totalAmountBeforeDiscount - discountAmount;

    // DPO Integration
    if (provider === "dpo") {
      // Create DPO Token
      const dpoResponse = await dpoService.createToken({
        amount: finalAmount,
        currency: "USD",
        email,
        description: `Order for Cart ${cart.id}`,
        metadata: { userId, cartId: cart.id, discountId, discountAmount },
        callbackUrl: `${clientUrl}/success?type=order&cartId=${cart.id}&discountId=${discountId || ''}&discountAmount=${discountAmount}`,
        phone: paymentDetails?.phoneNumber
      });

      // ... Mobile Money charge logic ...
      if (paymentDetails?.phoneNumber && paymentDetails?.mno) {
        try {
          await dpoService.chargeMobile({
            transactionToken: dpoResponse.transToken,
            phoneNumber: paymentDetails.phoneNumber,
            mno: paymentDetails.mno,
            mnoCountry: "rw"
          });
        } catch (error) {
          console.error("Auto-charge failed, falling back to payment page", error);
        }
      }

      return {
        id: dpoResponse.transToken,
        url: `https://secure.3gdirectpay.com/payv2.php?ID=${dpoResponse.transToken}`,
        provider: "dpo"
      };
    }

    if (provider === "paystack") {
      const exchangeRate = 1360;
      const amountInRwf = Math.round(finalAmount * exchangeRate);
      const paystackAmount = amountInRwf * 100;

      const session = await paystackService.initializeTransaction({
        email,
        amount: paystackAmount,
        currency: "RWF",
        callback_url: `${clientUrl}/orders`,
        metadata: { userId, cartId: cart.id, provider: "paystack", discountId, discountAmount },
        channels: ["mobile_money", "card"]
      });

      return {
        id: session.reference,
        url: session.authorization_url,
        provider: "paystack"
      };
    }

    // Default to Stripe
    if (!stripe) {
      throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to .env");
    }

    const lineItems = cart.cartItems.map((item: any) => {
      const imageUrl = validImage(safeImage(item.variant.product.images));

      // Distribute discount proportionally across items for Stripe or just add a discount line item
      // Stripe doesn't easily support negative line items without coupons, so we'll reduce prices
      const itemRatio = (item.variant.price * item.quantity) / totalAmountBeforeDiscount;
      const itemDiscount = (discountAmount * itemRatio) / item.quantity;
      const reducedPrice = Math.max(0, item.variant.price - itemDiscount);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${item.variant.product.name} (${item.variant.sku})`,
            images: [imageUrl],
            metadata: { variantId: item.variantId },
          },
          unit_amount: Math.round(reducedPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "MX", "EG", "RW"],
      },
      mode: "payment",
      success_url: `${clientUrl}/success?type=order&cartId=${cart.id}&provider=stripe&discountId=${discountId || ''}&discountAmount=${discountAmount}`,
      cancel_url: `${clientUrl}/cancel`,
      metadata: { userId, cartId: cart.id, discountId, discountAmount },
    });

    return {
      id: session.id,
      url: session.url,
      provider: "stripe"
    };
  }
}
