"use client";

import React from "react";
import { RecommendationResponse, Coupon } from "../types";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  CheckCircle,
  Clock,
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
      <div className="py-24 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin mx-auto text-[#0079C1] mb-2" />
        <p className="text-sm font-semibold text-slate-700">Computing real-time AI recommendations...</p>
        <p className="text-xs text-slate-400">Vectorizing 30-day RFM features & evaluating merchant coupons</p>
      </div>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <p className="font-bold">No active recommendations for this profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#0079C1]/10 text-[#0079C1] text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#0079C1]" />
              <span>Personalized Feed: {recommendations.persona}</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Model: {recommendations.model_version}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Data-Driven Merchant Coupons
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Every score below is mathematically calculated from your previous 30 days of purchases. Higher scores indicate strong category spending share, purchase frequency, and discount utility.
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs shrink-0 text-slate-600">
          <span className="font-bold text-slate-900">Explanation Source:</span>
          <p className="text-[11px] text-slate-500 mt-0.5">{recommendations.explanation_source}</p>
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
                  ? "border-amber-300 ring-2 ring-amber-100"
                  : "border-slate-200"
              }`}
            >
              {/* Card Header & Badges */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0079C1] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {coupon.merchant_name}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 capitalize">
                        {coupon.category}
                      </span>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center space-x-1 text-xs font-black px-2.5 py-1 rounded-full ${
                        isHighMatch
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-blue-50 text-[#0079C1] border border-blue-200"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{item.match_score}% Match</span>
                    </span>
                  </div>
                </div>

                {/* Attraction Intelligence Tag */}
                {item.attraction_tag && (
                  <div className="bg-slate-50 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200/80 flex items-center space-x-1.5">
                    <TrendingUp className="w-3 h-3 text-[#0079C1]" />
                    <span>{item.attraction_tag}</span>
                  </div>
                )}

                {/* Coupon Title & Description */}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {coupon.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {coupon.description}
                  </p>
                </div>

                {/* Natural Language AI Explanation */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100 text-xs text-slate-700">
                  <div className="flex items-center space-x-1.5 text-[#003087] font-bold text-[11px] mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0079C1]" />
                    <span>Why you received this offer:</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-slate-600">
                    {item.rationale}
                  </p>
                </div>

                {/* Pricing Rules */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Min Purchase:</span>
                    <span className="font-bold text-slate-800">
                      ₹{coupon.min_order_amount > 0 ? coupon.min_order_amount : "No Min"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Max Savings:</span>
                    <span className="font-bold text-emerald-600">
                      {coupon.max_discount ? `Up to ₹${coupon.max_discount}` : "Uncapped"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => onSelectCouponForCheckout(coupon)}
                  className="w-full bg-[#0079C1] hover:bg-[#005ea6] text-white font-extrabold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 text-xs"
                >
                  <span>Redeem with PayPal Sandbox</span>
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
