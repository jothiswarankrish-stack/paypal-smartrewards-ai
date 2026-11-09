"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Gift,
  ArrowRight,
  ExternalLink,
  Info,
  RefreshCw,
  Sparkles,
  HelpCircle,
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

  // Donation selection
  const [selectedPreset, setSelectedPreset] = useState<number | "custom" | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isConsentGiven, setIsConsentGiven] = useState<boolean>(true);

  // Flow states
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

  // Calculate donation amount
  const donationAmount =
    selectedPreset === null
      ? 0
      : selectedPreset === "custom"
      ? parseFloat(customAmount) || 0
      : selectedPreset;

  // Net redemption cash
  const rewardRedemption = Math.max(0, availablePoints - donationAmount);
  const remainingRewards = 0; // When converting available balance

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
      setErrorMessage(`Donation amount (₹${donationAmount}) exceeds your available rewards (₹${availablePoints}).`);
      return;
    }
    if (donationAmount > 0 && !isConsentGiven) {
      setErrorMessage("Please grant voluntary consent to proceed with the donation.");
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
        // Direct voluntary reward balance contribution
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
          // Skipping donation in coupon mode simply resets/closes
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
    <div className={`bg-white rounded-2xl border border-[#DDE3EA] shadow-xs overflow-hidden transition-all ${standalone ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}>
      {/* Header & Balance Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#DDE3EA] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-[#E5F2FC] text-[#0070E0]">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </span>
            <h3 className="text-lg font-extrabold text-[#001435]">
              PayPal Rewards for Good <span className="text-[#0070E0] text-sm font-semibold">— SmartRewards AI</span>
            </h3>
          </div>
          <p className="text-xs text-[#536477] mt-0.5">
            Turn your earned shopping rewards into real-world impact or wallet cash
          </p>
        </div>

        {/* Available Rewards Badge */}
        <div className="flex items-center space-x-3 bg-[#F5F7FA] border border-[#DDE3EA] px-4 py-2.5 rounded-xl">
          <div className="text-right">
            <p className="text-[11px] font-bold text-[#536477] uppercase tracking-wider">Your Available Rewards</p>
            <p className="text-xl font-black text-[#003087]">₹{availablePoints.toLocaleString()}</p>
          </div>
          <button
            onClick={loadData}
            title="Refresh balance"
            className="p-1.5 text-[#536477] hover:text-[#003087] rounded-md hover:bg-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      {step === "select" && (
        <div className="mt-5">
          <p className="text-xs font-bold text-[#001435] mb-2 uppercase tracking-wide">
            Choose how to use your rewards:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => { setMode("cash"); handleReset(); }}
              className={`flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                mode === "cash"
                  ? "bg-[#003087] text-white border-[#003087] shadow-xs"
                  : "bg-white text-[#001435] border-[#DDE3EA] hover:bg-[#F5F7FA]"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Convert Rewards into Cash</span>
            </button>

            <button
              onClick={() => { setMode("coupon"); handleReset(); }}
              className={`flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                mode === "coupon"
                  ? "bg-[#003087] text-white border-[#003087] shadow-xs"
                  : "bg-white text-[#001435] border-[#DDE3EA] hover:bg-[#F5F7FA]"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Redeem Reward Coupons & Donate</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      {step === "select" && (
        <div className="mt-6 pt-5 border-t border-[#DDE3EA]">
          {/* Heart Invitation */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 sm:p-5">
            <div className="flex items-start space-x-3">
              <span className="text-2xl shrink-0">❤️</span>
              <div>
                <h4 className="text-sm font-extrabold text-[#001435]">
                  Your rewards can make a difference.
                </h4>
                <p className="text-xs text-[#536477] mt-1 leading-relaxed">
                  Would you like to voluntarily contribute a small portion of your rewards to help homeless people,
                  underprivileged children and families in need? Every contribution counts. Your choice is completely optional.
                </p>
              </div>
            </div>

            {/* Beneficiary Selection */}
            <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
              <label className="block text-xs font-bold text-[#001435] mb-2">
                Select Verified Charity Beneficiary:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {beneficiaries.map((b) => {
                  const isSelected = selectedBeneficiaryId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBeneficiaryId(b.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#E5F2FC] border-[#0070E0] shadow-2xs"
                          : "bg-white border-[#DDE3EA] hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-[#0070E0] bg-white px-2 py-0.5 rounded-full border border-[#BDE0FE]">
                          {b.category}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0070E0]" />}
                      </div>
                      <p className="text-xs font-bold text-[#001435] mt-2 line-clamp-1">{b.name}</p>
                      <p className="text-[11px] text-[#536477] mt-1 line-clamp-2">{b.impact_summary || b.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preset Amount Chips */}
            <div className="mt-5">
              <p className="text-xs font-bold text-[#001435] mb-2">
                Suggested contribution amounts:
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                {[10, 25, 50, 100].map((amt) => {
                  const isSelected = selectedPreset === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectPreset(amt)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#0070E0] text-white border-[#0070E0] shadow-xs scale-105"
                          : "bg-white text-[#001435] border-[#DDE3EA] hover:bg-[#F5F7FA]"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleSelectCustom}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    selectedPreset === "custom"
                      ? "bg-[#0070E0] text-white border-[#0070E0] shadow-xs"
                      : "bg-white text-[#001435] border-[#DDE3EA] hover:bg-[#F5F7FA]"
                  }`}
                >
                  Custom Amount
                </button>
              </div>

              {selectedPreset === "custom" && (
                <div className="mt-3 flex items-center space-x-2 max-w-xs">
                  <span className="text-sm font-bold text-[#536477]">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={availablePoints}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 75)"
                    className="w-full text-xs font-bold p-2 border border-[#0070E0] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#0070E0]"
                  />
                </div>
              )}
            </div>

            {/* Dynamic Calculation Breakdown */}
            <div className="mt-5 bg-white border border-[#DDE3EA] rounded-xl p-4">
              <p className="text-[11px] font-bold text-[#536477] uppercase tracking-wider mb-2">
                Dynamic Transaction Breakdown:
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#536477]">
                  <span>Your Available Rewards:</span>
                  <span className="font-bold text-[#001435]">₹{availablePoints.toFixed(2)}</span>
                </div>
                {mode === "cash" && (
                  <div className="flex justify-between text-[#536477]">
                    <span>Reward Cash Payout:</span>
                    <span className="font-bold text-[#00875A]">₹{rewardRedemption.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#536477]">
                  <span>Voluntary Social Contribution:</span>
                  <span className={`font-bold ${donationAmount > 0 ? "text-rose-600" : "text-[#536477]"}`}>
                    {donationAmount > 0 ? `₹${donationAmount.toFixed(2)}` : "₹0 (Skipped)"}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#DDE3EA] flex justify-between font-extrabold text-[#001435]">
                  <span>Remaining Rewards Balance:</span>
                  <span>₹{remainingRewards.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Voluntary Statement & Consent Checkbox */}
            <div className="mt-4 flex items-start space-x-2">
              <input
                id="consentCheckbox"
                type="checkbox"
                checked={isConsentGiven}
                onChange={(e) => setIsConsentGiven(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-[#0070E0] focus:ring-[#0070E0] cursor-pointer"
              />
              <label htmlFor="consentCheckbox" className="text-[11px] text-[#536477] leading-tight cursor-pointer">
                <strong>100% Optional.</strong> Your decision is voluntary and will never affect your reward eligibility, discounts, or account terms.
              </label>
            </div>

            {errorMessage && (
              <p className="mt-3 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                ⚠️ {errorMessage}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={handleSkipDonation}
                disabled={isSubmitting || availablePoints <= 0}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-[#536477] hover:text-[#001435] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
              >
                Skip Donation & Redeem Full Rewards
              </button>

              <button
                type="button"
                onClick={handleProceedToConfirm}
                disabled={isSubmitting || availablePoints <= 0}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-full text-xs font-extrabold bg-[#003087] hover:bg-[#002266] text-white shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Step */}
      {step === "confirm" && (
        <div className="mt-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6">
          <div className="flex items-center space-x-2 text-[#003087] mb-3">
            <ShieldCheck className="w-5 h-5 text-[#00875A]" />
            <h4 className="text-sm font-extrabold text-[#001435]">Please Confirm Your Reward Distribution</h4>
          </div>
          <p className="text-xs text-[#536477] mb-4">
            Review the breakdown before submitting. Once processed, funds will be transferred to the verified beneficiary ledger.
          </p>

          <div className="bg-white border border-[#DDE3EA] rounded-xl p-4 space-y-2 text-xs mb-5">
            <div className="flex justify-between">
              <span className="text-[#536477]">Redemption Mode:</span>
              <span className="font-bold text-[#001435]">{mode === "cash" ? "Convert Rewards into PayPal Cash" : "Direct Reward Contribution"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#536477]">Gross Rewards Debited:</span>
              <span className="font-bold text-[#003087]">₹{availablePoints.toFixed(2)}</span>
            </div>
            {mode === "cash" && (
              <div className="flex justify-between">
                <span className="text-[#536477]">Net Cash to Your PayPal Wallet:</span>
                <span className="font-bold text-[#00875A]">₹{rewardRedemption.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#536477]">Voluntary Social Contribution:</span>
              <span className="font-bold text-rose-600">₹{donationAmount.toFixed(2)}</span>
            </div>
            {donationAmount > 0 && selectedBeneficiary && (
              <div className="flex justify-between pt-2 border-t border-[#DDE3EA]">
                <span className="text-[#536477]">Recipient Organization:</span>
                <span className="font-extrabold text-[#001435]">{selectedBeneficiary.name}</span>
              </div>
            )}
          </div>

          {errorMessage && (
            <p className="mb-4 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">
              ⚠️ {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setStep("select")}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#536477] hover:bg-[#E2E8F0] cursor-pointer"
            >
              Back & Modify
            </button>
            <button
              type="button"
              onClick={() => handleExecuteTransaction()}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-black bg-[#00875A] hover:bg-[#006E49] text-white shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <span>Processing Transaction...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Authorize</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Official Verified Receipt Display */}
      {step === "receipt" && receipt && (
        <div className="mt-6 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl p-6 text-left">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#00875A] text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#00875A] bg-white px-2 py-0.5 rounded-full border border-green-200">
                Official Impact Receipt
              </span>
              <h4 className="text-base font-extrabold text-[#001435] mt-0.5">
                Transaction Completed Successfully
              </h4>
            </div>
          </div>

          <p className="text-xs text-[#001435] mb-4 bg-white/70 p-3 rounded-lg border border-green-100">
            {receipt.message}
          </p>

          <div className="bg-white border border-[#DDE3EA] rounded-xl p-4 space-y-2 text-xs mb-5 font-mono">
            <div className="flex justify-between font-sans">
              <span className="text-[#536477]">PayPal Reference ID:</span>
              <span className="font-bold text-[#003087]">{receipt.paypal_reference_id}</span>
            </div>
            <div className="flex justify-between font-sans">
              <span className="text-[#536477]">Beneficiary:</span>
              <span className="font-bold text-[#001435]">{receipt.beneficiary_name || "N/A (Skipped)"}</span>
            </div>
            <div className="flex justify-between font-sans">
              <span className="text-[#536477]">Contribution Amount:</span>
              <span className="font-extrabold text-rose-600">₹{receipt.donation_amount.toFixed(2)}</span>
            </div>
            {receipt.cash_redeemed > 0 && (
              <div className="flex justify-between font-sans">
                <span className="text-[#536477]">PayPal Wallet Cash Credited:</span>
                <span className="font-extrabold text-[#00875A]">₹{receipt.cash_redeemed.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-sans pt-2 border-t border-[#DDE3EA]">
              <span className="text-[#536477]">Remaining Rewards Balance:</span>
              <span className="font-bold text-[#001435]">₹{receipt.remaining_balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-sans text-[11px] text-[#536477]">
              <span>Timestamp:</span>
              <span>{new Date(receipt.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded-full text-xs font-bold bg-[#003087] text-white hover:bg-[#002266] transition-colors cursor-pointer"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}

      {/* PayPal Donate SDK Integration Reference Box */}
      <div className="mt-6 pt-4 border-t border-[#DDE3EA] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#536477] gap-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#0070E0]" />
          <span>
            Powered by <strong>PayPal Giving Fund (PPGF)</strong> verified charity rails. No platform fee deductions.
          </span>
        </div>
        <a
          href="https://developer.paypal.com/sdk/donate/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-[#0070E0] hover:underline font-semibold"
        >
          <span>PayPal Donate SDK Specs</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
