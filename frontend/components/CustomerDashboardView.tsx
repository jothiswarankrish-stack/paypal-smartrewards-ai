"use client";

import React from "react";
import { SpendingInsights, RecommendationResponse, Coupon } from "../types";
import SpendingCharts from "./SpendingCharts";
import {
  Wallet,
  Sparkles,
  TrendingUp,
  Receipt,
  CreditCard,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Apple,
  Film,
  Plane,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface CustomerDashboardViewProps {
  insights: SpendingInsights | null;
  recommendations: RecommendationResponse | null;
  onSelectCouponForCheckout: (coupon: Coupon) => void;
  onExploreMoreRecommendations: () => void;
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
}: CustomerDashboardViewProps) {
  if (!insights) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Loading spending insights...</p>
      </div>
    );
  }

  const topRec = recommendations?.recommendations?.[0];
  const TopCategoryIcon = CATEGORY_ICONS[insights.highest_category.toLowerCase()] || Wallet;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#003087] to-[#0079C1] text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">
              SmartRewards Financial Profile
            </span>
            <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Live Synthetic Cohort
            </span>
          </div>
          <h2 className="text-2xl font-black mt-1 tracking-tight">
            Welcome back, {insights.customer_name}!
          </h2>
          <p className="text-xs text-blue-100 max-w-xl mt-1">
            Persona: <span className="font-bold text-amber-300">{insights.persona_name}</span>. Our AI continuously analyzes your previous 30 days of transactions to deliver targeted PayPal merchant discounts.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right shrink-0">
          <p className="text-[11px] text-blue-200">Verified Lifetime Savings</p>
          <p className="text-2xl font-black text-emerald-300 font-mono mt-0.5">
            +₹{insights.total_savings_lifetime.toFixed(2)}
          </p>
          <p className="text-[10px] text-blue-200/80 mt-0.5">Realized via PayPal Sandbox</p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>30-Day Spending Total</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{insights.total_spent_30d.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Across historical purchases</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Top Category</span>
            <TopCategoryIcon className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-2 capitalize flex items-center space-x-1.5">
            <span>{insights.highest_category}</span>
          </p>
          <span className="text-[11px] text-amber-600 font-bold">
            {insights.category_breakdown[0]?.percentage}% of total spending
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Orders Count</span>
            <Receipt className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {insights.recent_transactions.length}+ Orders
          </p>
          <span className="text-[11px] text-purple-600 font-semibold">Tracked for ML scoring</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Payment Method</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-[#0079C1] mt-2 flex items-center space-x-1">
            <span>PayPal Sandbox</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">Instant discount eligible</span>
        </div>
      </div>

      {/* Spotlight: Top AI Recommended Coupon */}
      {topRec && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border border-amber-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-slate-950" />
                <span>TOP AI MATCH ({topRec.match_score}% Confidence)</span>
              </span>
              <span className="text-xs font-bold text-amber-900 uppercase">
                {topRec.coupon.merchant_name}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900">{topRec.coupon.title}</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-amber-200">
              💡 <span className="font-bold">AI Rationale:</span> {topRec.rationale}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => onSelectCouponForCheckout(topRec.coupon)}
              className="bg-[#0079C1] hover:bg-[#005ea6] text-white font-extrabold px-5 py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
            >
              <span>Redeem with PayPal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreMoreRecommendations}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-3 rounded-xl border border-slate-200 transition text-sm text-center"
            >
              View All {recommendations?.recommendations.length} Matches
            </button>
          </div>
        </div>
      )}

      {/* Spending Breakdown Visualizations */}
      <SpendingCharts categoryBreakdown={insights.category_breakdown} />

      {/* Recent Historical Transactions Stream */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Recent 30-Day Transactions</h3>
            <p className="text-xs text-slate-500">
              Synthetic customer records powering RFM feature extraction
            </p>
          </div>
          <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full border border-slate-200">
            Synthetic Sample Data
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {insights.recent_transactions.slice(0, 6).map((tx) => {
            const Icon = CATEGORY_ICONS[tx.category.toLowerCase()] || Wallet;
            return (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{tx.merchant_name}</h5>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span className="capitalize">{tx.category}</span>
                      <span>•</span>
                      <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-slate-900 font-mono">
                    ₹{tx.amount.toFixed(2)}
                  </span>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
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
