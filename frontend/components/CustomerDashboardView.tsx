"use client";

import React from "react";
import { SpendingInsights, RecommendationResponse, Coupon } from "../types";
import SpendingCharts from "./SpendingCharts";
import {
  Wallet,
  Sparkles,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Apple,
  Film,
  Plane,
  ArrowRight,
  ShieldCheck,
  Heart,
  Tag,
  Gift,
  TrendingUp,
} from "lucide-react";

interface CustomerDashboardViewProps {
  insights: SpendingInsights | null;
  recommendations: RecommendationResponse | null;
  onSelectCouponForCheckout: (coupon: Coupon) => void;
  onExploreMoreRecommendations: () => void;
  onNavigateToGivingTab?: () => void;
}

const CATEGORY_ICONS: { [key: string]: any } = {
  food: UtensilsCrossed,
  taxi: Car,
  shopping: ShoppingBag,
  groceries: Apple,
  entertainment: Film,
  travel: Plane,
};

export default function CustomerDashboardView({
  insights,
  recommendations,
  onSelectCouponForCheckout,
  onExploreMoreRecommendations,
  onNavigateToGivingTab,
}: CustomerDashboardViewProps) {
  if (!insights) {
    return (
      <div className="text-center py-20 text-[#536477]">
        <div className="w-8 h-8 border-3 border-[#003087] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Loading your PayPal account...</p>
      </div>
    );
  }

  const topRec = recommendations?.recommendations?.[0];
  const TopCategoryIcon = CATEGORY_ICONS[insights.highest_category.toLowerCase()] || Wallet;

  return (
    <div className="space-y-4">
      {/* 1. Account Greeting & Persona Highlight */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-[11px] font-bold text-[#8B95A5]">Welcome back,</span>
          <h2 className="text-lg font-black text-[#001435] leading-tight">
            {insights.customer_name}
          </h2>
        </div>
        <div className="bg-[#E5F2FC] border border-[#D5E6F5] px-2.5 py-1 rounded-full text-right">
          <span className="text-[10px] font-black text-[#003087] uppercase tracking-wider block">
            {insights.persona_name}
          </span>
        </div>
      </div>

      {/* 2. PayPal Balance & Total Savings Card (Hero) */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E9EE] shadow-sm">
        <div className="flex items-center justify-between text-xs text-[#536477] font-semibold">
          <span>PayPal Balance & Savings</span>
          <span className="flex items-center space-x-1 text-[#00875A] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active</span>
          </span>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-black text-[#001435] tracking-tight">
              ₹{insights.total_savings_lifetime.toFixed(2)}
            </p>
            <p className="text-xs text-[#00875A] font-bold mt-0.5">
              + Total verified savings realized
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#8B95A5] block">Available Points</span>
            <span className="text-sm font-black text-[#003087]">₹500.00</span>
          </div>
        </div>

        {/* 4 Quick Action Circles (PayPal Mobile Style) */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-[#F0F2F5]">
          <button
            onClick={onExploreMoreRecommendations}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#E5F2FC] group-hover:bg-[#D0E7FA] flex items-center justify-center text-[#0070E0] transition-colors shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#001435] mt-1.5">Rewards</span>
          </button>

          <button
            onClick={onExploreMoreRecommendations}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#EBF9F1] group-hover:bg-[#D5F5E3] flex items-center justify-center text-[#00875A] transition-colors shadow-2xs">
              <Tag className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#001435] mt-1.5">Deals</span>
          </button>

          <button
            onClick={onNavigateToGivingTab}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#FFF0F2] group-hover:bg-[#FFE0E5] flex items-center justify-center text-rose-500 transition-colors shadow-2xs">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <span className="text-[11px] font-bold text-[#001435] mt-1.5">Giving</span>
          </button>

          <button
            onClick={onNavigateToGivingTab}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#FFF9E6] group-hover:bg-[#FFF2CC] flex items-center justify-center text-amber-600 transition-colors shadow-2xs">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#001435] mt-1.5">Convert</span>
          </button>
        </div>
      </div>

      {/* 3. Top AI Match Spotlight Banner (Dynamically Tailored) */}
      {topRec && (
        <div className="bg-gradient-to-br from-[#003087] via-[#0048A8] to-[#0070E0] rounded-3xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="bg-[#FFC439] text-[#001435] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-2xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Tailored For {insights.customer_name}</span>
            </span>
            <span className="text-[11px] font-black text-[#FFC439]">
              {topRec.match_score}% Match
            </span>
          </div>

          <h3 className="text-base font-extrabold text-white mt-1 leading-snug">
            {topRec.coupon.title}
          </h3>

          {/* Self-explanatory rationale */}
          <div className="mt-2 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-blue-100 leading-relaxed">
            <span className="font-bold text-[#FFC439]">Why this offer: </span>
            <span>{topRec.rationale}</span>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/15">
            <div>
              <span className="text-[10px] text-blue-200 block uppercase font-bold tracking-wider">
                Partner
              </span>
              <span className="text-xs font-black text-white">
                {topRec.coupon.merchant_name}
              </span>
            </div>

            <button
              onClick={() => onSelectCouponForCheckout(topRec.coupon)}
              className="bg-[#FFC439] hover:bg-[#F2B82E] text-[#001435] font-black px-4 py-2 rounded-full text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Redeem with PayPal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Monthly Spending & Category Breakdown (Self-Explanatory) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E9EE] shadow-2xs">
          <span className="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider block">
            30-Day Total Spend
          </span>
          <p className="text-lg font-black text-[#001435] mt-1 font-mono">
            ₹{insights.total_spent_30d.toLocaleString()}
          </p>
          <span className="text-[10px] text-[#536477] mt-0.5 block">
            {insights.recent_transactions.length} orders analyzed
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E9EE] shadow-2xs">
          <span className="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider block">
            Top Category
          </span>
          <p className="text-lg font-black text-[#001435] mt-1 capitalize truncate">
            {insights.highest_category}
          </p>
          <span className="text-[10px] text-[#0070E0] font-bold mt-0.5 block">
            {insights.category_breakdown[0]?.percentage}% of monthly spending
          </span>
        </div>
      </div>

      {/* 5. Category Spending Charts */}
      <div className="bg-white rounded-3xl p-4 border border-[#E5E9EE] shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <div>
            <h4 className="text-xs font-extrabold text-[#001435] uppercase tracking-wider">
              Category Distribution
            </h4>
            <p className="text-[10px] text-[#8B95A5]">Powers your AI reward ranking</p>
          </div>
          <span className="text-[10px] text-[#003087] font-bold bg-[#E5F2FC] px-2 py-0.5 rounded-full">
            30 Days
          </span>
        </div>
        <SpendingCharts categoryBreakdown={insights.category_breakdown} />
      </div>

      {/* 6. Recent Activity List */}
      <div className="bg-white rounded-3xl p-4 border border-[#E5E9EE] shadow-2xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-xs font-extrabold text-[#001435] uppercase tracking-wider">
              Recent Transactions ({insights.customer_name})
            </h3>
            <p className="text-[10px] text-[#8B95A5]">30-day customer transaction ledger</p>
          </div>
          <span className="text-[10px] font-bold text-[#00875A] bg-[#EBF9F1] px-2 py-0.5 rounded-full">
            Verified
          </span>
        </div>

        <div className="divide-y divide-[#F0F2F5]">
          {insights.recent_transactions.slice(0, 6).map((tx) => {
            const Icon = CATEGORY_ICONS[tx.category.toLowerCase()] || Wallet;
            return (
              <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors rounded-xl px-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#F0F7FD] text-[#0070E0] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#001435] leading-tight">
                      {tx.merchant_name}
                    </h5>
                    <div className="flex items-center space-x-1.5 text-[10px] text-[#8B95A5] mt-0.5">
                      <span className="capitalize">{tx.category}</span>
                      <span>•</span>
                      <span>{new Date(tx.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-xs text-[#001435] font-mono">
                    -₹{tx.amount.toFixed(2)}
                  </span>
                  <div className="text-[9px] text-[#00875A] font-bold uppercase mt-0.5">
                    {tx.payment_channel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
