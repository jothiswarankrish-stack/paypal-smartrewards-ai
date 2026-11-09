"use client";

import React, { useState, useEffect } from "react";
import { AdminPlatformStats, CohortItem } from "../types";
import { getAdminStats, getAdminCohorts, resetDemoData } from "../lib/api";
import {
  Users,
  Store,
  Ticket,
  RefreshCw,
  CheckCircle2,
  Loader2,
  ShieldCheck,
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
    } catch {
      setResetMessage("Failed to reset database.");
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-[#536477]">
        <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#0070E0] mb-2" />
        <p className="text-xs font-semibold">Loading Admin Operations Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header (PayPal Style Clean White Surface) */}
      <div className="p-7 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#E5F2FC] text-[#003087] border border-[#BDE0FE] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0070E0]" />
              <span>Platform Administration</span>
            </span>
            <span className="text-xs text-[#536477]">PayPal AI Hackathon 2026</span>
          </div>
          <h2 className="text-2xl font-black text-[#001435] mt-1.5">Operations & Model Telemetry</h2>
          <p className="text-xs text-[#536477]">
            Real-time platform performance, Customer Attraction Intelligence cohorts, and conversion metrics
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="bg-[#003087] hover:bg-[#002060] text-white font-bold px-5 py-2.5 rounded-full transition flex items-center space-x-2 text-xs shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-[#009CDE]" : "text-white"}`} />
          <span>Reset Demo Seed Data</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-3 bg-[#E3FCEF] border border-[#ABF5D1] text-[#00875A] text-xs rounded-xl flex items-center space-x-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#00875A]" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs">
          <span className="text-[#536477] text-xs font-bold block">Total Volume Processed</span>
          <p className="text-2xl font-black text-[#001435] mt-2 font-mono">
            ₹{stats?.total_volume_processed.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#0070E0] font-bold">Historical & Live Transactions</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs">
          <span className="text-[#536477] text-xs font-bold block">Verified Customer Savings</span>
          <p className="text-2xl font-black text-[#00875A] mt-2 font-mono">
            +₹{stats?.total_customer_savings.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#00875A] font-bold">Delivered via PayPal Checkout</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs">
          <span className="text-[#536477] text-xs font-bold block">Payment Capture Rate</span>
          <p className="text-2xl font-black text-[#001435] mt-2 font-mono">
            {stats?.paypal_conversion_rate}%
          </p>
          <span className="text-[11px] text-[#003087] font-bold">Selection to Capture</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs">
          <span className="text-[#536477] text-xs font-bold block">AI Click-Through Rate</span>
          <p className="text-2xl font-black text-[#001435] mt-2 font-mono">
            {stats?.ai_recommendation_click_through_rate}%
          </p>
          <span className="text-[11px] text-amber-700 font-bold">Impression Engagement</span>
        </div>
      </div>

      {/* Customer Attraction Intelligence: Controlled Cohorts Table */}
      <div className="p-6 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs">
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="bg-[#0070E0] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Attraction Intelligence
            </span>
            <h3 className="font-extrabold text-[#001435] text-sm">
              Controlled Synthetic Customer Cohort Comparison
            </h3>
          </div>
          <p className="text-xs text-[#536477] mt-0.5">
            Empirical comparison of coupon engagement against non-personalized baselines
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DDE3EA] text-[#536477] text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-bold">Cohort Configuration</th>
                <th className="pb-3 font-bold">Sample</th>
                <th className="pb-3 font-bold">Redemption Rate</th>
                <th className="pb-3 font-bold">Avg Order Value</th>
                <th className="pb-3 font-bold">PayPal Retention Lift</th>
                <th className="pb-3 font-bold">Evaluation Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE3EA]">
              {cohorts.map((c, idx) => (
                <tr key={idx} className={idx === 0 ? "bg-[#F0F7FD] font-semibold" : "hover:bg-[#F5F7FA]"}>
                  <td className="py-3.5 font-bold text-[#001435] flex items-center space-x-2">
                    {idx === 0 && <span className="w-2 h-2 rounded-full bg-[#0070E0] shrink-0"></span>}
                    <span>{c.cohort_name}</span>
                  </td>
                  <td className="py-3.5 text-[#536477] font-mono">{c.sample_size} users</td>
                  <td className="py-3.5 font-bold text-[#00875A] font-mono">{c.redemption_rate}%</td>
                  <td className="py-3.5 text-[#001435] font-mono">₹{c.avg_order_value}</td>
                  <td className="py-3.5 font-bold text-[#003087] font-mono">+{c.paypal_retention_lift}%</td>
                  <td className="py-3.5 text-[#536477] text-[11px]">{c.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ecosystem Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#F0F7FD] text-[#0070E0] rounded-2xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[#536477] text-xs font-semibold block">Total Customers</span>
            <span className="text-xl font-black text-[#001435]">{stats?.total_users} Users</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#E3FCEF] text-[#00875A] rounded-2xl flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[#536477] text-xs font-semibold block">Onboarded Merchants</span>
            <span className="text-xl font-black text-[#001435]">{stats?.total_merchants} Brands</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#F3E8FF] text-[#7E22CE] rounded-2xl flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[#536477] text-xs font-semibold block">Active Marketplace Offers</span>
            <span className="text-xl font-black text-[#001435]">{stats?.total_coupons} Coupons</span>
          </div>
        </div>
      </div>
    </div>
  );
}
