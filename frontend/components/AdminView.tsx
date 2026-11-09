"use client";

import React, { useState, useEffect } from "react";
import { AdminPlatformStats, CohortItem } from "../types";
import { getAdminStats, getAdminCohorts, resetDemoData } from "../lib/api";
import {
  ShieldAlert,
  Users,
  Store,
  Ticket,
  Receipt,
  TrendingUp,
  RefreshCw,
  BarChart2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function AdminView() {
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [s, c] = await Promise.all([getAdminStats(), getAdminCohorts()]);
      setStats(s);
      setCohorts(c);
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    setResetMessage(null);
    try {
      await resetDemoData();
      setResetMessage("Pristine demo database successfully restored with 5 customer profiles!");
      loadAdminData();
    } catch (err) {
      setResetMessage("Failed to reset database.");
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0079C1] mb-2" />
        <p className="text-xs">Loading Admin Operations Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Platform Administration
            </span>
            <span className="text-xs text-slate-400">PayPal AI Hackathon 2026</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Operations & Model Monitoring</h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry, Attraction Intelligence cohorts, and conversion audit
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 text-xs"
        >
          <RefreshCw className={`w-4 h-4 ${isResetting ? "animate-spin text-amber-400" : "text-slate-400"}`} />
          <span>Reset Demo Seed Data</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* High-Level Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold block">Total Volume Processed</span>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{stats?.total_volume_processed.toLocaleString()}
          </p>
          <span className="text-[11px] text-blue-600 font-bold">Historical & Live Transactions</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold block">Verified Customer Savings</span>
          <p className="text-2xl font-black text-emerald-600 mt-2 font-mono">
            +₹{stats?.total_customer_savings.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">Delivered via PayPal Checkout</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold block">Payment Capture Rate</span>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {stats?.paypal_conversion_rate}%
          </p>
          <span className="text-[11px] text-purple-600 font-bold">Selections to Sandbox Capture</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold block">AI Click-Through Rate</span>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {stats?.ai_recommendation_click_through_rate}%
          </p>
          <span className="text-[11px] text-amber-600 font-bold">Impressions to Engagement</span>
        </div>
      </div>

      {/* Customer Attraction Intelligence: Controlled Cohorts Table */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="bg-[#0079C1] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
              Attraction Intelligence
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Controlled Synthetic Customer Cohort Comparison
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical comparison of coupon engagement against non-personalized baselines
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-bold">Cohort Configuration</th>
                <th className="pb-3 font-bold">Sample</th>
                <th className="pb-3 font-bold">Redemption Rate</th>
                <th className="pb-3 font-bold">Avg Order Value</th>
                <th className="pb-3 font-bold">PayPal Retention Lift</th>
                <th className="pb-3 font-bold">Evaluation Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cohorts.map((c, idx) => (
                <tr key={idx} className={idx === 0 ? "bg-blue-50/50 font-medium" : "hover:bg-slate-50"}>
                  <td className="py-3 font-bold text-slate-900 flex items-center space-x-1.5">
                    {idx === 0 && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>}
                    <span>{c.cohort_name}</span>
                  </td>
                  <td className="py-3 text-slate-600 font-mono">{c.sample_size} users</td>
                  <td className="py-3 font-bold text-emerald-600 font-mono">{c.redemption_rate}%</td>
                  <td className="py-3 text-slate-700 font-mono">₹{c.avg_order_value}</td>
                  <td className="py-3 font-bold text-[#003087] font-mono">+{c.paypal_retention_lift}%</td>
                  <td className="py-3 text-slate-500 text-[11px]">{c.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ecosystem Inventory Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 text-[#0079C1] rounded-2xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Active Customers</span>
            <span className="text-xl font-black text-slate-900">{stats?.total_users} Users</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Onboarded Merchants</span>
            <span className="text-xl font-black text-slate-900">{stats?.total_merchants} Brands</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Total Active Offers</span>
            <span className="text-xl font-black text-slate-900">{stats?.total_coupons} Coupons</span>
          </div>
        </div>
      </div>
    </div>
  );
}
