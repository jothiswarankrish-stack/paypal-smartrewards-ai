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
      // 1. Backend creates PayPal Sandbox Order via Orders API v2
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#001435]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#DDE3EA] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Authentic PayPal Navy Header */}
        <div className="bg-[#003087] p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
              <span className="font-black text-xl italic text-[#003087]">P</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight">PayPal Checkout</span>
                <span className="bg-[#FFC439] text-[#001435] text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Sandbox
                </span>
              </div>
              <p className="text-xs text-[#E5F2FC]">SmartRewards AI Verified Merchant Discount</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
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
              <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#DDE3EA]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-extrabold text-[#0070E0] uppercase tracking-wider">
                      {coupon.merchant_name || "Merchant Reward"}
                    </span>
                    <h4 className="font-bold text-[#001435] text-sm mt-0.5">{coupon.title}</h4>
                  </div>
                  <div className="bg-[#E5F2FC] text-[#003087] font-black text-xs px-2.5 py-1 rounded-full border border-[#BDE0FE]">
                    {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                  </div>
                </div>
                <div className="mt-2.5 text-xs text-[#536477] font-mono bg-white p-2.5 rounded-lg border border-[#DDE3EA] flex justify-between items-center">
                  <span className="font-sans font-bold text-[11px] text-[#536477]">PROMO CODE:</span>
                  <span className="font-bold text-[#001435]">{coupon.code}</span>
                </div>
              </div>

              {/* Order Amount Selector */}
              <div>
                <label className="block text-xs font-bold text-[#001435] mb-1.5 flex justify-between">
                  <span>Order Cart Amount (INR / USD)</span>
                  <span className="text-[#536477] font-normal">Min purchase: ₹{coupon.min_order_amount}</span>
                </label>
                <div className="flex items-center space-x-2.5">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-[#536477] font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min={coupon.min_order_amount || 50}
                      step="50"
                      value={cartAmount}
                      onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-[#DDE3EA] rounded-xl text-sm font-bold text-[#001435] focus:outline-none focus:ring-2 focus:ring-[#0070E0] bg-[#F5F7FA]"
                    />
                  </div>
                  <div className="flex space-x-1">
                    {[500, 1000, 2000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAmountChange(preset)}
                        className={`text-xs px-3 py-2 rounded-xl border font-bold ${
                          cartAmount === preset
                            ? "bg-[#003087] text-white border-[#003087]"
                            : "bg-white text-[#001435] border-[#DDE3EA] hover:bg-[#F5F7FA]"
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PayPal Price Breakdown (Clean Light Blue Surface) */}
              <div className="p-4 rounded-xl bg-[#F0F7FD] border border-[#BDE0FE] space-y-2.5">
                <div className="flex justify-between text-xs text-[#536477]">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-[#001435]">₹{cartAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#00875A] font-bold">
                  <span>SmartRewards Discount:</span>
                  <span className="font-mono">
                    -₹{validationResult?.discount_amount ? validationResult.discount_amount.toFixed(2) : "0.00"}
                  </span>
                </div>
                <div className="border-t border-[#DDE3EA] pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-[#001435]">Total Payable with PayPal:</span>
                  <span className="text-2xl font-black text-[#003087] font-mono">
                    ₹{validationResult?.final_amount ? validationResult.final_amount.toFixed(2) : cartAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Server Validation Message */}
              {validationResult && (
                <p className={`text-xs text-center font-bold ${validationResult.is_eligible ? "text-[#00875A]" : "text-amber-700"}`}>
                  {validationResult.message}
                </p>
              )}

              {/* Action Button: Create PayPal Order */}
              <button
                onClick={handleInitiatePayPalOrder}
                disabled={!validationResult?.is_eligible || isProcessing || isValidating}
                className="w-full bg-[#0070E0] hover:bg-[#003087] disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-full shadow-xs transition flex items-center justify-center space-x-2 text-sm"
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
              <div className="w-14 h-14 bg-[#E5F2FC] text-[#0070E0] rounded-full mx-auto flex items-center justify-center border border-[#BDE0FE]">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-extrabold text-[#001435] text-base">PayPal Sandbox Approval Ready</h3>
                <p className="text-xs text-[#536477] mt-1">
                  Server-generated PayPal Order ID: <code className="bg-[#F5F7FA] border border-[#DDE3EA] px-1.5 py-0.5 rounded text-[#003087] font-bold">{createdOrderId}</code>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#DDE3EA] text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#536477]">Merchant Partner:</span>
                  <span className="font-bold text-[#001435]">{coupon.merchant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#536477]">Verified Discount:</span>
                  <span className="font-bold text-[#00875A] font-mono">
                    -₹{validationResult?.discount_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#DDE3EA] pt-2 font-extrabold text-[#001435]">
                  <span>Authorized Charge:</span>
                  <span className="font-mono text-[#003087] text-sm">₹{validationResult?.final_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Official PayPal Gold Button */}
              <div className="space-y-2.5">
                <button
                  onClick={handleApproveAndCapture}
                  disabled={isProcessing}
                  className="w-full bg-[#FFC439] hover:bg-[#F2B82E] text-[#001435] font-black py-3.5 px-4 rounded-full shadow-xs transition flex items-center justify-center space-x-2 text-sm border border-[#E5AD24]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#003087]" />
                      <span>Verifying & Capturing Payment...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#003087] font-black italic text-base">PayPal</span>
                      <span className="font-bold">Approve & Complete Payment (Sandbox)</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#536477]">
                  Executes authentic server-to-server <code>POST /v2/checkout/orders/{'{id}'}/capture</code>
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT CAPTURED CONFIRMATION & VERIFIED RECEIPT */}
          {activeStep === "completed" && completedPayment && (
            <div className="space-y-5 text-center py-2 animate-in fade-in">
              <div className="w-16 h-16 bg-[#E3FCEF] text-[#00875A] rounded-full mx-auto flex items-center justify-center border border-[#ABF5D1]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="font-extrabold text-[#001435] text-lg">Payment Verified & Captured</h3>
                <p className="text-xs text-[#536477] mt-0.5">
                  Coupon discount applied and verified through the PayPal Developer Platform.
                </p>
              </div>

              {/* Verified Digital Receipt */}
              <div className="p-4 rounded-2xl bg-[#F5F7FA] border border-[#DDE3EA] text-left text-xs space-y-2.5 shadow-2xs">
                <div className="flex items-center space-x-2 pb-2 border-b border-[#DDE3EA] text-[#001435] font-bold">
                  <Receipt className="w-4 h-4 text-[#00875A]" />
                  <span>Verified PayPal Sandbox Receipt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#536477]">Capture ID:</span>
                  <span className="font-mono font-bold text-[#001435]">{completedPayment.capture_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#536477]">Order ID:</span>
                  <span className="font-mono text-[#536477]">{completedPayment.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#536477]">Payer Account:</span>
                  <span className="font-medium text-[#001435]">{completedPayment.payer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#536477]">Verified Savings:</span>
                  <span className="font-mono font-bold text-[#00875A]">
                    +₹{completedPayment.discount_saved.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#DDE3EA] pt-2 font-black text-[#001435] text-sm">
                  <span>Total Paid:</span>
                  <span className="font-mono text-[#003087]">₹{completedPayment.final_amount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-[#003087] hover:bg-[#002060] text-white font-extrabold py-3 px-4 rounded-full shadow-xs transition text-sm"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
