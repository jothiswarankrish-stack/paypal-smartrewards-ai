"use client";

import React, { useState, useEffect } from "react";
import { User, MerchantStats, Coupon } from "../types";
import {
  getMerchantStats,
  getMerchantCoupons,
  createCoupon,
  toggleCouponStatus,
} from "../lib/api";
import {
  Store,
  Plus,
  Ticket,
  TrendingUp,
  Receipt,
  Users,
  CheckCircle,
  X,
  Loader2,
  Power,
} from "lucide-react";

interface MerchantViewProps {
  currentUser: User | null;
}

export default function MerchantView({ currentUser }: MerchantViewProps) {
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrder, setMinOrder] = useState<number>(400);
  const [maxDiscount, setMaxDiscount] = useState<number>(150);
  const [usageLimit, setUsageLimit] = useState<number>(500);

  useEffect(() => {
    loadMerchantData();
  }, [currentUser]);

  const loadMerchantData = async () => {
    setIsLoading(true);
    try {
      const merchantId = currentUser?.id || "merch-swiggy-01";
      const [s, c] = await Promise.all([
        getMerchantStats(merchantId),
        getMerchantCoupons(merchantId),
      ]);
      setStats(s);
      setCoupons(c);
    } catch (err) {
      console.error("Failed to load merchant portal data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 90);

      await createCoupon({
        merchant_id: stats?.merchant_id || "merch-swiggy-01",
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        category: category.toLowerCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: Number(minOrder),
        max_discount: discountType === "percentage" ? Number(maxDiscount) : null,
        expiry_date: expiry.toISOString(),
        usage_limit: Number(usageLimit),
      });

      setIsModalOpen(false);
      resetForm();
      loadMerchantData();
    } catch (err: any) {
      setFormError(err.message || "Failed to create coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCode("");
    setTitle("");
    setDescription("");
    setDiscountValue(20);
    setMinOrder(400);
    setMaxDiscount(150);
  };

  const handleToggle = async (couponId: string) => {
    try {
      await toggleCouponStatus(couponId);
      loadMerchantData();
    } catch (err) {
      console.error("Failed to toggle coupon:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0079C1] mb-2" />
        <p className="text-xs">Loading merchant portal dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Merchant Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Verified Merchant Partner
            </span>
            <span className="text-xs text-slate-400 font-medium capitalize">
              Industry: {stats?.category}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {stats?.business_name || "Merchant Rewards Portal"}
          </h2>
          <p className="text-xs text-slate-500">
            Create high-intent personalized discount campaigns redeemable via PayPal
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Active Coupons</span>
            <Ticket className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {stats?.active_coupons_count || 0}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Live on marketplace</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Redemptions</span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {stats?.total_redemptions || 0}
          </p>
          <span className="text-[11px] text-blue-600 font-bold">Successful checkouts</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Sales Volume Generated</span>
            <Receipt className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{stats?.total_sales_generated.toLocaleString() || "0"}
          </p>
          <span className="text-[11px] text-purple-600 font-bold">PayPal GMV</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {stats?.conversion_rate || 0}%
          </p>
          <span className="text-[11px] text-amber-600 font-bold">Impression to capture</span>
        </div>
      </div>

      {/* Active Coupons Management Table */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-extrabold text-slate-900 text-sm mb-4">
          Manage Merchant Discount Offers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-bold">Promo Code</th>
                <th className="pb-3 font-bold">Offer Title</th>
                <th className="pb-3 font-bold">Discount</th>
                <th className="pb-3 font-bold">Min Spend</th>
                <th className="pb-3 font-bold">Times Used</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-mono font-bold text-slate-900">{c.code}</td>
                  <td className="py-3 font-medium text-slate-800">{c.title}</td>
                  <td className="py-3 font-bold text-emerald-600">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                  </td>
                  <td className="py-3 text-slate-600">₹{c.min_order_amount}</td>
                  <td className="py-3 text-slate-600">
                    {c.times_used} / {c.usage_limit}
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.is_active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggle(c.id)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                        c.is_active
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {c.is_active ? "Pause" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-sm">Create New Reward Coupon</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 text-[11px]">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., SWIGGYPARTY25"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full uppercase font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., 25% OFF on Weekend Family Dining"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Terms and conditions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={minOrder}
                    onChange={(e) => setMinOrder(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                {discountType === "percentage" && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Cap (₹)</label>
                    <input
                      type="number"
                      min={10}
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl transition text-xs shadow-md mt-2 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Coupon...</span>
                  </>
                ) : (
                  <span>Publish Offer to Marketplace</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
