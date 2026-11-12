"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Gift,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { DonationBeneficiary, CustomerRewardBalance, DonationReceipt } from "../types";
import {
  getDonationBeneficiaries,
  getCustomerRewardBalance,
  contributeDonation,
  convertRewardsToCash,
} from "../lib/api";

interface DonationPanelProps {
  customerId: string;
  onDonationSuccess?: () => void;
  standalone?: boolean;
}

export default function DonationPanel({
  customerId,
  onDonationSuccess,
  standalone = false,
}: DonationPanelProps) {
  const [mode, setMode] = useState<"cash" | "coupon">("cash");
  const [balance, setBalance] = useState<CustomerRewardBalance | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<DonationBeneficiary[]>([]);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>("");

  const [selectedPreset, setSelectedPreset] = useState<number | "custom" | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isConsentGiven, setIsConsentGiven] = useState<boolean>(true);

  const [step, setStep] = useState<"select" | "confirm" | "receipt">("select");
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [customerId]);

  const loadData = async () => {
    try {
      const [bal, bens] = await Promise.all([
        getCustomerRewardBalance(customerId),
        getDonationBeneficiaries(),
      ]);
      setBalance(bal);
      setBeneficiaries(bens);
      if (bens.length > 0 && !selectedBeneficiaryId) {
        setSelectedBeneficiaryId(bens[0].id);
      }
    } catch (err) {
      console.error("Failed to load donation panel data:", err);
    }
  };

  const availablePoints = balance ? balance.available_reward_points : 500;

  const donationAmount =
    selectedPreset === null
      ? 0
      : selectedPreset === "custom"
      ? parseFloat(customAmount) || 0
      : selectedPreset;

  const rewardRedemption = Math.max(0, availablePoints - donationAmount);

  const handleSelectPreset = (amount: number) => {
    setSelectedPreset(amount);
    setErrorMessage(null);
  };

  const handleSelectCustom = () => {
    setSelectedPreset("custom");
    setErrorMessage(null);
  };

  const handleSkipDonation = () => {
    setSelectedPreset(null);
    setCustomAmount("");
    setErrorMessage(null);
    handleExecuteTransaction(0);
  };

  const handleProceedToConfirm = () => {
    if (donationAmount < 0) {
      setErrorMessage("Donation amount cannot be negative.");
      return;
    }
    if (donationAmount > availablePoints) {
      setErrorMessage(`Donation exceeds available rewards (₹${availablePoints}).`);
      return;
    }
    if (donationAmount > 0 && !isConsentGiven) {
      setErrorMessage("Please grant voluntary consent.");
      return;
    }
    setErrorMessage(null);
    setStep("confirm");
  };

  const handleExecuteTransaction = async (overrideDonation?: number) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const finalDonation = overrideDonation !== undefined ? overrideDonation : donationAmount;

    try {
      let resp: DonationReceipt;
      if (mode === "cash") {
        resp = await convertRewardsToCash({
          customer_id: customerId,
          amount_to_redeem: availablePoints,
          donation_amount: finalDonation,
          beneficiary_id: finalDonation > 0 ? selectedBeneficiaryId : undefined,
          customer_consent: finalDonation > 0 ? isConsentGiven : false,
          currency: "INR",
        });
      } else {
        if (finalDonation > 0) {
          resp = await contributeDonation({
            customer_id: customerId,
            beneficiary_id: selectedBeneficiaryId,
            amount: finalDonation,
            currency: "INR",
            customer_consent: isConsentGiven,
            source_type: "coupon_redemption",
          });
        } else {
          setStep("select");
          setIsSubmitting(false);
          return;
        }
      }

      setReceipt(resp);
      setStep("receipt");
      await loadData();
      if (onDonationSuccess) {
        onDonationSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process reward transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("select");
    setSelectedPreset(null);
    setCustomAmount("");
    setReceipt(null);
    setErrorMessage(null);
  };

  const selectedBeneficiary = beneficiaries.find((b) => b.id === selectedBeneficiaryId);

  return (
    <div className="bg-white rounded-3xl border border-[#E5E9EE] shadow-2xs overflow-hidden p-4">
      {/* Header & Balance Display */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="w-6 h-6 rounded-full bg-[#FFF0F2] text-rose-500 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
            </span>
            <h3 className="text-xs font-extrabold text-[#001435]">
              Rewards for Good
            </h3>
          </div>
          <p className="text-[10px] text-[#8B95A5] mt-0.5">
            Convert points to wallet cash or support causes
          </p>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-bold text-[#8B95A5] uppercase">Points</p>
          <p className="text-sm font-black text-[#003087]">₹{availablePoints.toLocaleString()}</p>
        </div>
      </div>

      {/* Mode Switcher */}
      {step === "select" && (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setMode("cash"); handleReset(); }}
              className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                mode === "cash"
                  ? "bg-[#003087] text-white border-[#003087] shadow-xs"
                  : "bg-white text-[#001435] border-[#E5E9EE] hover:bg-[#F5F7FA]"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Convert to Cash</span>
            </button>

            <button
              onClick={() => { setMode("coupon"); handleReset(); }}
              className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                mode === "coupon"
                  ? "bg-[#003087] text-white border-[#003087] shadow-xs"
                  : "bg-white text-[#001435] border-[#E5E9EE] hover:bg-[#F5F7FA]"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Direct Donate</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      {step === "select" && (
        <div className="mt-3 space-y-3">
          {/* Beneficiary Selection */}
          <div>
            <label className="block text-[11px] font-bold text-[#001435] mb-1.5">
              Select Verified Charity:
            </label>
            <div className="space-y-1.5">
              {beneficiaries.map((b) => {
                const isSelected = selectedBeneficiaryId === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBeneficiaryId(b.id)}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#E5F2FC] border-[#0070E0]"
                        : "bg-white border-[#E5E9EE]"
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-bold text-[#001435]">{b.name}</p>
                      <p className="text-[10px] text-[#8B95A5] truncate">{b.impact_summary || b.description}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0070E0] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preset Amount Chips */}
          <div>
            <p className="text-[11px] font-bold text-[#001435] mb-1.5">
              Contribution amount:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[10, 25, 50, 100].map((amt) => {
                const isSelected = selectedPreset === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#0070E0] text-white border-[#0070E0]"
                        : "bg-white text-[#001435] border-[#E5E9EE]"
                    }`}
                  >
                    ₹{amt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Calculation Breakdown */}
          <div className="bg-[#F5F7FA] border border-[#E5E9EE] rounded-2xl p-3 text-xs space-y-1.5">
            <div className="flex justify-between text-[#536477]">
              <span>Available Rewards:</span>
              <span className="font-bold text-[#001435]">₹{availablePoints.toFixed(2)}</span>
            </div>
            {mode === "cash" && (
              <div className="flex justify-between text-[#536477]">
                <span>Wallet Payout:</span>
                <span className="font-bold text-[#00875A]">₹{rewardRedemption.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#536477]">
              <span>Voluntary Charity:</span>
              <span className={`font-bold ${donationAmount > 0 ? "text-rose-600" : "text-[#536477]"}`}>
                {donationAmount > 0 ? `₹${donationAmount.toFixed(2)}` : "₹0"}
              </span>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-xl">
              {errorMessage}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={handleSkipDonation}
              disabled={isSubmitting || availablePoints <= 0}
              className="text-xs font-bold text-[#8B95A5] hover:text-[#001435] cursor-pointer"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleProceedToConfirm}
              disabled={isSubmitting || availablePoints <= 0}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-full text-xs font-black bg-[#003087] hover:bg-[#002060] text-white shadow-xs cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Step */}
      {step === "confirm" && (
        <div className="mt-3 bg-[#F8FAFC] border border-[#E5E9EE] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center space-x-1.5 text-[#003087]">
            <ShieldCheck className="w-4 h-4 text-[#00875A]" />
            <h4 className="font-extrabold text-[#001435]">Confirm Distribution</h4>
          </div>

          <div className="space-y-1.5 text-[#536477] bg-white p-3 rounded-xl border border-[#E5E9EE]">
            <div className="flex justify-between">
              <span>Points Debited:</span>
              <span className="font-bold text-[#003087]">₹{availablePoints.toFixed(2)}</span>
            </div>
            {mode === "cash" && (
              <div className="flex justify-between">
                <span>Wallet Credit:</span>
                <span className="font-bold text-[#00875A]">₹{rewardRedemption.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Charity Amount:</span>
              <span className="font-bold text-rose-600">₹{donationAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setStep("select")}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-[#8B95A5] cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => handleExecuteTransaction()}
              disabled={isSubmitting}
              className="flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-black bg-[#00875A] hover:bg-[#006E49] text-white shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm</span>
            </button>
          </div>
        </div>
      )}

      {/* Receipt Step */}
      {step === "receipt" && receipt && (
        <div className="mt-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#00875A] text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h4 className="font-extrabold text-[#001435]">Completed Successfully</h4>
              <p className="text-[10px] text-[#536477]">Ref: {receipt.paypal_reference_id}</p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2 rounded-full text-xs font-bold bg-[#003087] text-white cursor-pointer"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
