"use client";

import React from "react";
import { SpendingInsights, RecommendationResponse, Coupon } from "../types";
import SpendingCharts from "./SpendingCharts";
import {
  Wallet,
  Sparkles,
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
  TrendingUp,
  Heart,
  Gift,
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
      <div className="text-center py-24 text-[#536477]">
        <p className="text-sm font-semibold">Loading spending insights...</p>
      </div>
    );
  }

  const topRec = recommendations?.recommendations?.[0];
  const TopCategoryIcon = CATEGORY_ICONS[insights.highest_category.toLowerCase()] || Wallet;

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Savings Hero Card (PayPal Brand Style) */}
      <div className="p-7 rounded-2xl bg-white border border-[#DDE3EA] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-extrabold text-[#0070E0] uppercase tracking-wider">
              PayPal SmartRewards AI Dashboard
            </span>
            <span className="bg-[#EBF3FB] text-[#003087] border border-[#BDE0FE] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Controlled Synthetic Cohort
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#001435] mt-1.5 tracking-tight">
            Welcome back, {insights.customer_name}
          </h1>
          <p className="text-xs text-[#536477] max-w-xl mt-1 leading-relaxed">
            Active Persona: <span className="font-bold text-[#003087]">{insights.persona_name}</span>. Our machine learning recommendation engine analyzes your last 30 days of purchases to surface relevant financial rewards redeemable at PayPal checkout.
          </p>
        </div>

        {/* Verified Lifetime Savings Callout */}
        <div className="bg-[#F0F7FD] rounded-2xl p-5 border border-[#BDE0FE] text-left md:text-right shrink-0 w-full md:w-auto shadow-2xs">
          <p className="text-xs font-bold text-[#003087] flex items-center md:justify-end space-x-1">
            <ShieldCheck className="w-4 h-4 text-[#0070E0]" />
            <span>Verified Lifetime Savings</span>
          </p>
          <p className="text-3xl font-black text-[#00875A] font-mono mt-1">
            +₹{insights.total_savings_lifetime.toFixed(2)}
          </p>
          <p className="text-[11px] text-[#536477] mt-0.5">Realized via PayPal Sandbox</p>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs">
          <div className="flex justify-between items-center text-[#536477] text-xs font-bold">
            <span>30-Day Total Spending</span>
            <div className="w-8 h-8 rounded-full bg-[#F0F7FD] flex items-center justify-center text-[#0070E0]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#001435] mt-2 font-mono">
            ₹{insights.total_spent_30d.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#536477] font-medium">Historical transaction volume</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs">
          <div className="flex justify-between items-center text-[#536477] text-xs font-bold">
            <span>Highest Spend Vertical</span>
            <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
              <TopCategoryIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#001435] mt-2 capitalize flex items-center space-x-1.5">
            <span>{insights.highest_category}</span>
          </p>
          <span className="text-[11px] text-[#0070E0] font-bold">
            {insights.category_breakdown[0]?.percentage}% of your monthly expenses
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs">
          <div className="flex justify-between items-center text-[#536477] text-xs font-bold">
            <span>Transactions Analyzed</span>
            <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#7E22CE]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#001435] mt-2 font-mono">
            {insights.recent_transactions.length}+ Orders
          </p>
          <span className="text-[11px] text-[#536477] font-medium">Model RFM features extracted</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs">
          <div className="flex justify-between items-center text-[#536477] text-xs font-bold">
            <span>Preferred Checkout</span>
            <div className="w-8 h-8 rounded-full bg-[#EBF3FB] flex items-center justify-center text-[#003087]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#003087] mt-2 font-mono">
            PayPal
          </p>
          <span className="text-[11px] text-[#00875A] font-bold">Instant Sandbox discount eligible</span>
        </div>
      </div>

      {/* Rewards for Good & Available Balance Spotlight */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FFF5F5] via-[#FFF8F6] to-[#FFFFFF] border border-[#FECDD3] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                PayPal Rewards for Good
              </span>
              <span className="text-xs font-bold text-[#001435]">Available Reward Balance: ₹500.00</span>
            </div>
            <p className="text-xs text-[#536477] mt-1 leading-relaxed">
              Convert your rewards into instant PayPal cash or voluntarily contribute a portion to feed school children or shelter homeless families.
            </p>
          </div>
        </div>

        {onNavigateToGivingTab && (
          <button
            onClick={onNavigateToGivingTab}
            className="shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-black bg-[#003087] hover:bg-[#002266] text-white shadow-xs cursor-pointer transition-all"
          >
            <span>Convert / Donate Rewards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Top AI Match Spotlight Banner */}
      {topRec && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#F0F7FD] via-[#EBF3FB] to-[#F5F7FA] border border-[#BDE0FE] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-[#003087] text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#009CDE]" />
                <span>TOP AI MATCH ({topRec.match_score}% Confidence)</span>
              </span>
              <span className="text-xs font-bold text-[#0070E0] uppercase">
                {topRec.coupon.merchant_name}
              </span>
            </div>
            <h3 className="text-lg font-black text-[#001435]">{topRec.coupon.title}</h3>
            <div className="text-xs text-[#001435] bg-white p-3.5 rounded-xl border border-[#DDE3EA] shadow-2xs">
              <span className="font-bold text-[#003087]">AI Recommendation Rationale: </span>
              <span className="text-[#536477]">{topRec.rationale}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => onSelectCouponForCheckout(topRec.coupon)}
              className="bg-[#0070E0] hover:bg-[#003087] text-white font-extrabold px-6 py-3 rounded-full shadow-xs transition flex items-center justify-center space-x-2 text-xs"
            >
              <span>Redeem with PayPal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreMoreRecommendations}
              className="bg-white hover:bg-[#F5F7FA] text-[#001435] font-bold px-4 py-3 rounded-full border border-[#DDE3EA] transition text-xs text-center"
            >
              View All {recommendations?.recommendations.length} Matches
            </button>
          </div>
        </div>
      )}

      {/* Spending Breakdown Charts */}
      <SpendingCharts categoryBreakdown={insights.category_breakdown} />

      {/* Recent Transactions Table */}
      <div className="p-6 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#001435]">Recent 30-Day Transactions</h3>
            <p className="text-xs text-[#536477]">
              Synthetic customer records powering RFM feature extraction and category scoring
            </p>
          </div>
          <span className="text-[11px] bg-[#F5F7FA] text-[#536477] font-semibold px-3 py-1 rounded-full border border-[#DDE3EA]">
            Synthetic Demonstration Data
          </span>
        </div>

        <div className="divide-y divide-[#DDE3EA]">
          {insights.recent_transactions.slice(0, 6).map((tx) => {
            const Icon = CATEGORY_ICONS[tx.category.toLowerCase()] || Wallet;
            return (
              <div key={tx.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F7FD] text-[#0070E0] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#001435]">{tx.merchant_name}</h5>
                    <div className="flex items-center space-x-2 text-[11px] text-[#536477]">
                      <span className="capitalize">{tx.category}</span>
                      <span>•</span>
                      <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-[#001435] font-mono">
                    ₹{tx.amount.toFixed(2)}
                  </span>
                  <div className="text-[10px] text-[#0070E0] font-bold uppercase tracking-wider">
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
