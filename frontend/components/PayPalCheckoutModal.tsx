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
  ExternalLink,
  Sparkles,
  Receipt,
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

  // Set default initial cart amount based on coupon
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
      // 1. Backend creates official PayPal Sandbox Order via Orders API v2
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
      // 2. Server-side capture of approved order on PayPal Developer Platform
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003087] to-[#0079C1] p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
              P
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base">PayPal Checkout</span>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded uppercase">
                  Sandbox
                </span>
              </div>
              <p className="text-xs text-blue-100">SmartRewards AI Verified Merchant Discount</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: REVIEW & DISCOUNT CALCULATION */}
          {activeStep === "review" && (
            <div className="space-y-5">
              {/* Selected Offer Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-[#0079C1] uppercase tracking-wider">
                      {coupon.merchant_name || "Merchant Reward"}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{coupon.title}</h4>
                  </div>
                  <div className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-full border border-emerald-300">
                    {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-600 font-mono bg-white p-2 rounded border border-slate-200 flex justify-between">
                  <span>PROMO CODE:</span>
                  <span className="font-bold text-slate-900">{coupon.code}</span>
                </div>
              </div>

              {/* Order Amount Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
                  <span>Order Cart Amount (INR / USD equivalent)</span>
                  <span className="text-slate-400 font-normal">Min purchase: ₹{coupon.min_order_amount}</span>
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min={coupon.min_order_amount || 50}
                      step="50"
                      value={cartAmount}
                      onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0079C1]"
                    />
                  </div>
                  {/* Quick amount presets */}
                  <div className="flex space-x-1">
                    {[500, 1000, 2000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAmountChange(preset)}
                        className={`text-xs px-2.5 py-2 rounded-lg border font-medium ${
                          cartAmount === preset
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Breakdown Calculation */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono text-slate-200">₹{cartAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                  <span>SmartRewards Verified Discount:</span>
                  <span className="font-mono">
                    -₹{validationResult?.discount_amount ? validationResult.discount_amount.toFixed(2) : "0.00"}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-bold">Total Payable with PayPal:</span>
                  <span className="text-xl font-extrabold text-amber-300 font-mono">
                    ₹{validationResult?.final_amount ? validationResult.final_amount.toFixed(2) : cartAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Eligibility Notice */}
              {validationResult && (
                <p className={`text-xs text-center font-medium ${validationResult.is_eligible ? "text-emerald-600" : "text-amber-600"}`}>
                  {validationResult.message}
                </p>
              )}

              {/* Action Button: Create PayPal Sandbox Order */}
              <button
                onClick={handleInitiatePayPalOrder}
                disabled={!validationResult?.is_eligible || isProcessing || isValidating}
                className="w-full bg-[#0079C1] hover:bg-[#005ea6] disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating PayPal Sandbox Order...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to PayPal Sandbox</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: PAYPAL SANDBOX APPROVAL & CAPTURE */}
          {activeStep === "paypal_approval" && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-blue-50 text-[#0079C1] rounded-full mx-auto flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">PayPal Sandbox Checkout Ready</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Server generated PayPal Order: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold">{createdOrderId}</code>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Merchant:</span>
                  <span className="font-bold text-slate-900">{coupon.merchant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coupon Discount Applied:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    -₹{validationResult?.discount_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                  <span>Amount to Authorize:</span>
                  <span className="font-mono text-blue-700">₹{validationResult?.final_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* Simulated / Real Sandbox Approval Button */}
                <button
                  onClick={handleApproveAndCapture}
                  disabled={isProcessing}
                  className="w-full bg-[#ffc439] hover:bg-[#f4bb34] text-slate-900 font-black py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm border border-amber-400"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                      <span>Verifying & Capturing Payment...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#003087] font-black italic">PayPal</span>
                      <span>Approve & Complete Payment (Sandbox)</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400">
                  Runs official server-to-server <code>POST /v2/checkout/orders/{'{id}'}/capture</code>
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT CAPTURE CONFIRMED & VERIFIED RECEIPT */}
          {activeStep === "completed" && completedPayment && (
            <div className="space-y-5 text-center py-2 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Payment Verified & Captured!</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your coupon reward has been recorded on the blockchain/database ledger.
                </p>
              </div>

              {/* Verified Digital Receipt */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 text-left text-xs space-y-2.5 shadow-xs">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 text-slate-800 font-bold">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Verified PayPal Sandbox Receipt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capture ID:</span>
                  <span className="font-mono font-bold text-slate-900">{completedPayment.capture_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono text-slate-700">{completedPayment.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer Account:</span>
                  <span className="font-medium text-slate-800">{completedPayment.payer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified Savings:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    +₹{completedPayment.discount_saved.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-sm">
                  <span>Total Paid:</span>
                  <span className="font-mono text-blue-700">₹{completedPayment.final_amount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition text-sm"
              >
                Back to Dashboard & Savings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
