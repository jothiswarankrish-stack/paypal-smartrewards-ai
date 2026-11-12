"use client";

import React, { useState, useEffect } from "react";
import { Coupon, User, PayPalCaptureResponse } from "../types";
import { validateCoupon, createPayPalOrder, capturePayPalOrder } from "../lib/api";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Receipt,
  Heart,
  Sparkles,
} from "lucide-react";

interface PayPalCheckoutModalProps {
  coupon: Coupon | null;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export default function PayPalCheckoutModal({
  coupon,
  currentUser,
  isOpen,
  onClose,
  onPaymentSuccess,
}: PayPalCheckoutModalProps) {
  const [cartAmount, setCartAmount] = useState<number>(600);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    is_eligible: boolean;
    discount_amount: number;
    final_amount: number;
    message: string;
  } | null>(null);

  const [activeStep, setActiveStep] = useState<"review" | "paypal_approval" | "completed">("review");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [completedPayment, setCompletedPayment] = useState<PayPalCaptureResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkoutDonationAmount, setCheckoutDonationAmount] = useState<number>(0);

  useEffect(() => {
    if (coupon) {
      const initial = Math.max(coupon.min_order_amount || 400, 600);
      setCartAmount(initial);
      runValidation(initial, coupon.id);
      setActiveStep("review");
      setCompletedPayment(null);
      setErrorMessage(null);
    }
  }, [coupon]);

  const runValidation = async (amount: number, couponId: string) => {
    setIsValidating(true);
    setErrorMessage(null);
    try {
      const res = await validateCoupon(couponId, amount);
      setValidationResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to validate coupon");
    } finally {
      setIsValidating(false);
    }
  };

  const handleAmountChange = (newAmount: number) => {
    setCartAmount(newAmount);
    if (coupon) {
      runValidation(newAmount, coupon.id);
    }
  };

  const handleInitiatePayPalOrder = async () => {
    if (!currentUser || !coupon) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const orderResp = await createPayPalOrder(
        currentUser.id,
        coupon.id,
        cartAmount,
        "USD"
      );
      setCreatedOrderId(orderResp.order_id);
      setActiveStep("paypal_approval");
    } catch (err: any) {
      setErrorMessage(err.message || "Could not create PayPal Sandbox order.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAndCapture = async () => {
    if (!createdOrderId) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const captureResp = await capturePayPalOrder(createdOrderId);
      setCompletedPayment(captureResp);
      setActiveStep("completed");
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Payment capture failed verification.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#001435]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#DDE3EA] max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-8 duration-200">
        
        {/* PayPal Header */}
        <div className="bg-[#003087] p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
              <span className="font-black text-lg italic text-[#003087]">P</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm tracking-tight">PayPal Checkout</span>
                <span className="bg-[#FFC439] text-[#001435] text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                  Verified
                </span>
              </div>
              <p className="text-[10px] text-blue-200">SmartRewards Discount Applied</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: REVIEW & DISCOUNT CALCULATION */}
          {activeStep === "review" && (
            <div className="space-y-4">
              {/* Selected Offer Card */}
              <div className="p-3.5 rounded-2xl bg-[#F5F7FA] border border-[#E5E9EE]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#0070E0] uppercase tracking-wider">
                      {coupon.merchant_name || "Partner Offer"}
                    </span>
                    <h4 className="font-extrabold text-[#001435] text-xs mt-0.5">{coupon.title}</h4>
                  </div>
                  <div className="bg-[#EBF9F1] text-[#00875A] font-black text-xs px-2.5 py-0.5 rounded-full">
                    {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                  </div>
                </div>
              </div>

              {/* Order Amount Selector */}
              <div>
                <label className="block text-xs font-bold text-[#001435] mb-1.5 flex justify-between">
                  <span>Cart Total</span>
                  <span className="text-[#8B95A5] font-normal text-[11px]">Min: ₹{coupon.min_order_amount}</span>
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-[#536477] font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min={coupon.min_order_amount || 50}
                      step="50"
                      value={cartAmount}
                      onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-[#E5E9EE] rounded-2xl text-sm font-bold text-[#001435] focus:outline-none focus:ring-2 focus:ring-[#0070E0] bg-[#F5F7FA]"
                    />
                  </div>
                  <div className="flex space-x-1">
                    {[500, 1000, 2000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAmountChange(preset)}
                        className={`text-xs px-2.5 py-2 rounded-xl border font-bold cursor-pointer ${
                          cartAmount === preset
                            ? "bg-[#003087] text-white border-[#003087]"
                            : "bg-white text-[#001435] border-[#E5E9EE] hover:bg-[#F5F7FA]"
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PayPal Price Breakdown */}
              <div className="p-4 rounded-2xl bg-[#F0F7FD] border border-[#D5E6F5] space-y-2">
                <div className="flex justify-between text-xs text-[#536477]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#001435]">₹{cartAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#00875A] font-bold">
                  <span>Rewards Discount</span>
                  <span>
                    -₹{validationResult?.discount_amount ? validationResult.discount_amount.toFixed(2) : "0.00"}
                  </span>
                </div>
                <div className="border-t border-[#D5E6F5] pt-2 flex justify-between items-baseline">
                  <span className="text-xs font-black text-[#001435]">Total to Pay</span>
                  <span className="text-xl font-black text-[#003087]">
                    ₹{validationResult?.final_amount ? validationResult.final_amount.toFixed(2) : cartAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Optional Micro-Donation from Rewards */}
              <div className="p-3 rounded-2xl bg-white border border-[#E5E9EE] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#001435] flex items-center gap-1.5 text-[11px]">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span>Optional Charity Round-Up</span>
                  </span>
                  <span className="text-[10px] text-[#0070E0] font-bold">
                    Balance: ₹500
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {[0, 10, 25].map((amt) => {
                    const isSelected = checkoutDonationAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCheckoutDonationAmount(amt)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#0070E0] text-white border-[#0070E0]"
                            : "bg-[#F5F7FA] text-[#001435] border-[#E5E9EE]"
                        }`}
                      >
                        {amt === 0 ? "None" : `+₹${amt}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button: Continue to PayPal */}
              <button
                onClick={handleInitiatePayPalOrder}
                disabled={!validationResult?.is_eligible || isProcessing || isValidating}
                className="w-full bg-[#0070E0] hover:bg-[#003087] disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-full shadow-xs transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing PayPal Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with PayPal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: PAYPAL APPROVAL */}
          {activeStep === "paypal_approval" && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-[#E5F2FC] text-[#0070E0] rounded-full mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-extrabold text-[#001435] text-sm">Confirm Payment</h3>
                <p className="text-[11px] text-[#8B95A5] mt-0.5">
                  Order ID: {createdOrderId}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F5F7FA] border border-[#E5E9EE] text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#536477]">Merchant</span>
                  <span className="font-bold text-[#001435]">{coupon.merchant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#536477]">Discount</span>
                  <span className="font-bold text-[#00875A]">
                    -₹{validationResult?.discount_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E5E9EE] pt-2 font-black text-[#001435]">
                  <span>Authorized Charge</span>
                  <span className="text-[#003087] text-sm">₹{validationResult?.final_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Official PayPal Gold Button */}
              <button
                onClick={handleApproveAndCapture}
                disabled={isProcessing}
                className="w-full bg-[#FFC439] hover:bg-[#F2B82E] text-[#001435] font-black py-3.5 px-4 rounded-full shadow-xs transition-all flex items-center justify-center space-x-2 text-sm border border-[#E5AD24] cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#003087]" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#003087] font-black italic text-base">PayPal</span>
                    <span className="font-extrabold">Pay Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: PAYMENT COMPLETED */}
          {activeStep === "completed" && completedPayment && (
            <div className="space-y-4 text-center py-2 animate-in fade-in">
              <div className="w-14 h-14 bg-[#EBF9F1] text-[#00875A] rounded-full mx-auto flex items-center justify-center border border-[#D5F5E3]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-extrabold text-[#001435] text-base">Payment Successful!</h3>
                <p className="text-xs text-[#536477] mt-0.5">
                  Coupon discount applied and payment captured.
                </p>
              </div>

              {/* Verified Digital Receipt */}
              <div className="p-3.5 rounded-2xl bg-[#F5F7FA] border border-[#E5E9EE] text-left text-xs space-y-2">
                <div className="flex items-center space-x-1.5 pb-2 border-b border-[#E5E9EE] text-[#001435] font-bold">
                  <Receipt className="w-3.5 h-3.5 text-[#00875A]" />
                  <span>PayPal Receipt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B95A5]">Capture ID:</span>
                  <span className="font-mono font-bold text-[#001435]">{completedPayment.capture_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B95A5]">Savings Realized:</span>
                  <span className="font-bold text-[#00875A]">
                    +₹{completedPayment.discount_saved.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E5E9EE] pt-2 font-black text-[#001435]">
                  <span>Total Paid:</span>
                  <span className="text-[#003087]">₹{completedPayment.final_amount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-[#003087] hover:bg-[#002060] text-white font-extrabold py-3 px-4 rounded-full shadow-xs transition-all text-xs cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
