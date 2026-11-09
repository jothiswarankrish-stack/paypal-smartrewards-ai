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
      <div className="py-24 text-center text-[#536477]">
        <Sparkles className="w-8 h-8 animate-spin mx-auto text-[#0070E0] mb-2" />
        <p className="text-sm font-semibold text-[#001435]">Computing AI-personalized recommendations...</p>
        <p className="text-xs text-[#536477]">Analyzing 30-day RFM features & evaluating active merchant rewards</p>
      </div>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="p-12 text-center text-[#536477] bg-white rounded-2xl border border-[#DDE3EA]">
        <p className="font-bold">No active recommendations for this profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info Banner (PayPal Blue Theme) */}
      <div className="p-6 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#E5F2FC] text-[#0070E0] text-xs font-extrabold px-3 py-1 rounded-full flex items-center space-x-1.5 border border-[#BDE0FE]">
              <Sparkles className="w-3.5 h-3.5 text-[#0070E0]" />
              <span>Personalized Recommendations: {recommendations.persona}</span>
            </span>
            <span className="text-xs text-[#536477] font-mono">
              Model: {recommendations.model_version}
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#001435] mt-1.5">
            Targeted Merchant Offers
          </h2>
          <p className="text-xs text-[#536477] max-w-2xl mt-0.5 leading-relaxed">
            Every match score below is mathematically calculated from your recent 30-day transactions. Offers align with your frequent categories, average purchase size, and timing.
          </p>
        </div>

        <div className="bg-[#F0F7FD] p-3.5 rounded-xl border border-[#DDE3EA] text-xs shrink-0 text-[#001435]">
          <span className="font-bold text-[#003087]">Explanation Engine:</span>
          <p className="text-[11px] text-[#536477] mt-0.5">{recommendations.explanation_source}</p>
        </div>
      </div>

      {/* Recommended Coupons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.recommendations.map((item) => {
          const coupon = item.coupon;
          const Icon = CATEGORY_ICONS[coupon.category.toLowerCase()] || Tag;
          const isHighMatch = item.match_score >= 85;

          return (
            <div
              key={item.id}
              className={`rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                isHighMatch
                  ? "border-[#0070E0] ring-2 ring-[#0070E0]/15"
                  : "border-[#DDE3EA]"
              }`}
            >
              {/* Card Header & Content */}
              <div className="p-5 space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#F0F7FD] text-[#0070E0] flex items-center justify-center border border-[#BDE0FE]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold text-[#536477] uppercase tracking-wider block">
                        {coupon.merchant_name}
                      </span>
                      <span className="text-xs font-bold text-[#001435] capitalize">
                        {coupon.category}
                      </span>
                    </div>
                  </div>

                  {/* AI Match Score Badge */}
                  <span
                    className={`inline-flex items-center space-x-1 text-xs font-black px-2.5 py-1 rounded-full ${
                      isHighMatch
                        ? "bg-[#E5F2FC] text-[#003087] border border-[#BDE0FE]"
                        : "bg-[#F5F7FA] text-[#536477] border border-[#DDE3EA]"
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#0070E0]" />
                    <span>{item.match_score}% Match</span>
                  </span>
                </div>

                {/* Attraction Intelligence Tag */}
                {item.attraction_tag && (
                  <div className="bg-[#F0F7FD] text-[#003087] text-[11px] font-bold px-3 py-1.5 rounded-xl border border-[#BDE0FE] flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#0070E0]" />
                    <span>{item.attraction_tag}</span>
                  </div>
                )}

                {/* Coupon Title & Description */}
                <div>
                  <h4 className="font-extrabold text-[#001435] text-sm leading-snug">
                    {coupon.title}
                  </h4>
                  <p className="text-xs text-[#536477] mt-1 line-clamp-2 leading-relaxed">
                    {coupon.description}
                  </p>
                </div>

                {/* Natural Language AI Explanation Callout (PayPal Light Blue Surface) */}
                <div className="p-3.5 rounded-xl bg-[#F0F7FD] border border-[#BDE0FE] text-xs text-[#001435]">
                  <div className="flex items-center space-x-1.5 text-[#003087] font-bold text-[11px] mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0070E0]" />
                    <span>Why you received this recommendation:</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-[#536477]">
                    {item.rationale}
                  </p>
                </div>

                {/* Pricing Rules */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#DDE3EA]">
                  <div>
                    <span className="text-[#536477] block">Min Purchase:</span>
                    <span className="font-bold text-[#001435]">
                      ₹{coupon.min_order_amount > 0 ? coupon.min_order_amount : "No Min"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#536477] block">Max Savings:</span>
                    <span className="font-bold text-[#00875A]">
                      {coupon.max_discount ? `Up to ₹${coupon.max_discount}` : "Uncapped"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: PayPal Blue Button */}
              <div className="p-4 bg-[#F5F7FA] border-t border-[#DDE3EA]">
                <button
                  onClick={() => onSelectCouponForCheckout(coupon)}
                  className="w-full bg-[#0070E0] hover:bg-[#003087] text-white font-extrabold py-3 px-4 rounded-full shadow-xs transition flex items-center justify-center space-x-2 text-xs"
                >
                  <span>Redeem with PayPal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
