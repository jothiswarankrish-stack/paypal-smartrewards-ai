"use client";

import React from "react";
import { RecommendationResponse, Coupon } from "../types";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Apple,
  Film,
  Plane,
} from "lucide-react";

interface RecommendationsViewProps {
  recommendations: RecommendationResponse | null;
  onSelectCouponForCheckout: (coupon: Coupon) => void;
  isLoading: boolean;
}

const CATEGORY_ICONS: { [key: string]: any } = {
  food: UtensilsCrossed,
  taxi: Car,
  shopping: ShoppingBag,
  groceries: Apple,
  entertainment: Film,
  travel: Plane,
};

export default function RecommendationsView({
  recommendations,
  onSelectCouponForCheckout,
  isLoading,
}: RecommendationsViewProps) {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#536477]">
        <div className="w-8 h-8 border-3 border-[#003087] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-[#001435]">Finding your personalized rewards...</p>
        <p className="text-[11px] text-[#8B95A5] mt-0.5">Matching active partner offers with your habits</p>
      </div>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="p-8 text-center text-[#536477] bg-white rounded-3xl border border-[#E5E9EE]">
        <p className="font-bold text-xs">No active rewards available right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Mobile Feed Header Banner */}
      <div className="bg-white p-4 rounded-3xl border border-[#E5E9EE] shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-[#E5F2FC] text-[#0070E0] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-extrabold text-[#001435]">
            Rewards for You
          </span>
        </div>
        <p className="text-[11px] text-[#536477] mt-1 leading-relaxed">
          Offers matched to your spending habits, ready to apply directly at PayPal checkout.
        </p>
      </div>

      {/* Recommended Coupons Cards Stack */}
      <div className="space-y-3">
        {recommendations.recommendations.map((item) => {
          const coupon = item.coupon;
          const Icon = CATEGORY_ICONS[coupon.category.toLowerCase()] || Tag;

          return (
            <div
              key={item.id}
              className="rounded-3xl bg-white border border-[#E5E9EE] p-4 shadow-2xs hover:shadow-sm transition-all"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#F0F7FD] text-[#0070E0] flex items-center justify-center shrink-0 border border-[#E5F2FC]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-[#8B95A5] uppercase tracking-wider block">
                      {coupon.merchant_name}
                    </span>
                    <h4 className="font-extrabold text-xs text-[#001435] mt-0.5 leading-snug">
                      {coupon.title}
                    </h4>
                  </div>
                </div>

                {/* Match percentage pill */}
                <span className="bg-[#EBF9F1] text-[#00875A] text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                  {item.match_score}% Match
                </span>
              </div>

              {/* Rationale explanation callout */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F0F2F5] text-[11px] text-[#536477] leading-relaxed">
                <span className="font-bold text-[#003087]">Why: </span>
                <span>{item.rationale}</span>
              </div>

              {/* Offer details & action button */}
              <div className="mt-3 pt-2.5 border-t border-[#F0F2F5] flex items-center justify-between">
                <div className="text-[10px] text-[#8B95A5]">
                  <span>Min ₹{coupon.min_order_amount || 0}</span>
                  {coupon.max_discount && <span> • Cap ₹{coupon.max_discount}</span>}
                </div>

                <button
                  onClick={() => onSelectCouponForCheckout(coupon)}
                  className="bg-[#0070E0] hover:bg-[#003087] text-white font-black px-4 py-1.5 rounded-full text-xs shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <span>Redeem</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
