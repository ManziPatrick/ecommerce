"use client";
import { useInitiateCheckoutMutation } from "@/app/store/apis/CheckoutApi";
import React, { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import useToast from "@/app/hooks/ui/useToast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { useValidateDiscountMutation } from "@/app/store/apis/DiscountApi";
import { Ticket, X } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
  shippingRate?: number;
  currency?: string;
  totalItems: number;
  cartId: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  shippingRate = 0.01,
  currency = "$",
  totalItems,
}) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

  const [provider, setProvider] = React.useState<"stripe" | "paystack" | "dpo">("stripe");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [mno, setMno] = React.useState("mtn");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; value: number; type: string } | null>(null);

  const [initiateCheckout, { isLoading }] = useInitiateCheckoutMutation();
  const [validateDiscount, { isLoading: isValidating }] = useValidateDiscountMutation();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await validateDiscount({ code: couponCode, amount: subtotal }).unwrap();
      setAppliedDiscount({
        code: res.data.discount.code,
        value: res.data.discount.value,
        type: res.data.discount.type,
      });
      showToast("Coupon applied successfully!", "success");
    } catch (err: any) {
      showToast(err?.data?.message || "Invalid coupon code", "error");
    }
  };

  const removeCoupon = () => {
    setAppliedDiscount(null);
    setCouponCode("");
  };

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === "PERCENTAGE") {
      return (subtotal * appliedDiscount.value) / 100;
    }
    return appliedDiscount.value;
  }, [appliedDiscount, subtotal]);

  const shippingFee = useMemo(
    () => (subtotal - discountAmount) * shippingRate,
    [subtotal, discountAmount, shippingRate]
  );

  const total = useMemo(() => subtotal - discountAmount + shippingFee, [subtotal, discountAmount, shippingFee]);

  const handleInitiateCheckout = async () => {
    try {
      const payload: any = { provider };
      if (provider === "dpo") {
        if (!phoneNumber) {
          showToast("Please enter your phone number", "error");
          return;
        }
        payload.phoneNumber = phoneNumber;
        payload.mno = mno;
      }

      if (appliedDiscount) {
        payload.couponCode = appliedDiscount.code;
      }

      const res = await initiateCheckout(payload).unwrap();

      if (res.provider === "paystack" || res.provider === "dpo") {
        window.location.href = res.url;
        return;
      }

      // Stripe Fallback
      if (res.sessionId && stripePromise) {
        const stripe = await stripePromise;
        if (!stripe) {
          showToast("Stripe not configured", "error");
          return;
        }
        const result = await stripe.redirectToCheckout({
          sessionId: res.sessionId,
        });
        if (result?.error) {
          showToast(result.error.message, "error");
        }
      } else if (res.url) {
        window.location.href = res.url;
      }
    } catch {
      showToast("Failed to initiate checkout", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 shadow-sm"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        Order Summary
      </h2>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Total Items</span>
          <span className="font-medium">{totalItems}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">
            {currency}
            {subtotal.toFixed(2)}
          </span>
        </div>

        {appliedDiscount && (
          <div className="flex justify-between text-green-600 font-medium bg-green-50 px-3 py-2 rounded-md">
            <span className="flex items-center gap-1.5">
              <Ticket size={14} /> Coupon ({appliedDiscount.code})
            </span>
            <span>
              -{currency}
              {discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Shipping ({(shippingRate * 100).toFixed(0)}%)</span>
          <span className="font-medium text-gray-900">
            {currency}
            {shippingFee.toFixed(2)}
          </span>
        </div>

        {/* Coupon Input */}
        <div className="pt-2">
          {!appliedDiscount ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-grow text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={isValidating || !couponCode}
                className="px-4 py-2 bg-gray-800 text-white rounded-md text-xs font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-400"
              >
                {isValidating ? "..." : "Apply"}
              </button>
            </div>
          ) : (
            <button
              onClick={removeCoupon}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
            >
              <X size={14} /> Remove Coupon
            </button>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-lg font-bold text-indigo-700">
            {currency}
            {total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Payment Method</h3>
        <div className="grid gap-3">
          <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${provider === "stripe" ? "border-indigo-600 bg-indigo-50/30" : "border-gray-200 hover:bg-gray-50"}`}>
            <input
              type="radio"
              name="paymentProvider"
              value="stripe"
              checked={provider === "stripe"}
              onChange={() => setProvider("stripe")}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Credit Card (Stripe)</span>
          </label>
          <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${provider === "paystack" ? "border-indigo-600 bg-indigo-50/30" : "border-gray-200 hover:bg-gray-50"}`}>
            <input
              type="radio"
              name="paymentProvider"
              value="paystack"
              checked={provider === "paystack"}
              onChange={() => setProvider("paystack")}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Paystack (MoMo / Card)</span>
          </label>
          <label className={`flex flex-col space-y-3 p-3 border rounded-lg cursor-pointer transition-all ${provider === "dpo" ? "border-indigo-600 bg-indigo-50/30" : "border-gray-200 hover:bg-gray-50"}`}>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentProvider"
                value="dpo"
                checked={provider === "dpo"}
                onChange={() => setProvider("dpo")}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">DPO (Mobile Money)</span>
            </div>

            <AnimatePresence>
              {provider === "dpo" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mt-2 pl-7 space-y-3 pb-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Network</label>
                      <select
                        value={mno}
                        onChange={(e) => setMno(e.target.value)}
                        className="w-full text-sm border-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="airtel">Airtel Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="250..."
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full text-sm border-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </label>
        </div>
      </div>

      {isAuthenticated ? (
        <button
          disabled={isLoading || totalItems === 0}
          onClick={handleInitiateCheckout}
          className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isLoading ? "Preparing Order..." : "Finalize & Pay"}
        </button>
      ) : (
        <Link
          href="/sign-in"
          className="mt-8 w-full inline-block text-center bg-gray-100 text-gray-800 py-4 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all"
        >
          Sign in to Checkout
        </Link>
      )}
    </motion.div>
  );
};

export default CartSummary;

