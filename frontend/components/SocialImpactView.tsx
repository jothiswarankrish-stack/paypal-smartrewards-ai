"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Globe2,
  Sparkles,
  Users,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  ExternalLink,
  DollarSign,
  Gift,
} from "lucide-react";
import { ColDef } from "ag-grid-community";
import AGGridTable from "./AGGridTable";
import DonationPanel from "./DonationPanel";
import { SocialImpactStats, User } from "../types";
import { getSocialImpactStats } from "../lib/api";

interface SocialImpactViewProps {
  currentUser: User | null;
  onOpenGivingDayModal: () => void;
}

export default function SocialImpactView({
  currentUser,
  onOpenGivingDayModal,
}: SocialImpactViewProps) {
  const [stats, setStats] = useState<SocialImpactStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getSocialImpactStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load social impact stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // AG Grid columns definition for the verified donation ledger
  const columnDefs = useMemo<ColDef[]>(() => {
    return [
      {
        field: "paypal_reference_id",
        headerName: "PayPal Reference ID",
        minWidth: 190,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs font-bold text-[#003087]">
            {params.value}
          </span>
        ),
      },
      {
        field: "customer_name",
        headerName: "Donor / Persona",
        minWidth: 150,
        cellRenderer: (params: any) => (
          <span className="font-semibold text-xs text-[#001435]">
            {params.value}
          </span>
        ),
      },
      {
        field: "beneficiary_name",
        headerName: "Charity Beneficiary",
        minWidth: 230,
        cellRenderer: (params: any) => (
          <span className="font-medium text-xs text-[#001435] flex items-center gap-1.5">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
            <span className="truncate">{params.value}</span>
          </span>
        ),
      },
      {
        field: "amount",
        headerName: "Amount",
        minWidth: 120,
        cellRenderer: (params: any) => (
          <span className="font-bold text-xs text-rose-600">
            ₹{Number(params.value || 0).toFixed(2)}
          </span>
        ),
      },
      {
        field: "source_type",
        headerName: "Redemption Source",
        minWidth: 150,
        cellRenderer: (params: any) => {
          const type = params.value || "reward_balance";
          return (
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E5F2FC] text-[#0070E0] border border-[#BDE0FE]">
              {type.replace("_", " ")}
            </span>
          );
        },
      },
      {
        field: "timestamp",
        headerName: "Date & Time",
        minWidth: 160,
        cellRenderer: (params: any) => (
          <span className="text-xs text-[#536477]">
            {params.value ? new Date(params.value).toLocaleString() : "Just now"}
          </span>
        ),
      },
    ];
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#001435] via-[#003087] to-[#0070E0] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-[#002244]">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 mb-3">
            <span className="bg-[#FFC439] text-[#001435] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" /> PAYPAL REWARDS FOR GOOD & GIVING DAY
            </span>
            <span className="text-blue-200 text-xs">• 100% Voluntary Giving</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Turning Platform Earnings & Shopping Rewards into Real-World Good
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
            PayPal SmartRewards connects commerce with purpose. Today, PayPal dedicates 100% of platform earnings
            from transactions to verified causes—and customers can voluntarily contribute earned shopping rewards
            to help homeless families, children's nutrition, and education.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onOpenGivingDayModal}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-black bg-[#FFC439] hover:bg-[#F2BA36] text-[#001435] shadow-xs cursor-pointer"
            >
              <Globe2 className="w-4 h-4 text-[#001435]" />
              <span>Explore Global Giving Day Model & Vote</span>
            </button>

            <a
              href="#redemption-panel"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-xs cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Redeem & Donate Your Rewards</span>
            </a>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Aggregate Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#DDE3EA] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#536477]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Contributed</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Heart className="w-4 h-4 fill-rose-600" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#001435] mt-2">
            ₹{(stats?.total_donated || 36825).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#00875A] font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 100% Verified Charity Ledger
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE3EA] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#536477]">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Donors</span>
            <span className="p-2 bg-blue-50 text-[#0070E0] rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#001435] mt-2">
            {(stats?.total_donors_count || 718).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#536477] font-medium mt-1">
            Across 5 synthetic customer cohorts
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE3EA] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#536477]">
            <span className="text-xs font-bold uppercase tracking-wider">Average Contribution</span>
            <span className="p-2 bg-emerald-50 text-[#00875A] rounded-xl">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#001435] mt-2">
            ₹{(stats?.avg_donation_amount || 51.28).toFixed(2)}
          </p>
          <p className="text-[11px] text-[#536477] font-medium mt-1">
            Micro-donations powered by rewards
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE3EA] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#536477]">
            <span className="text-xs font-bold uppercase tracking-wider">Giving Day Status</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#003087] mt-2">
            Active Today
          </p>
          <p className="text-[11px] text-[#0070E0] font-bold mt-1">
            $0 customer fee • 100% corporate
          </p>
        </div>
      </div>

      {/* Beneficiary Cause Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#001435]">Verified Charitable Beneficiaries</h2>
            <p className="text-xs text-[#536477]">
              Funds are disbursed through PayPal Giving Fund rails directly to verified bank accounts
            </p>
          </div>
          <span className="text-xs text-[#0070E0] font-bold bg-[#E5F2FC] px-3 py-1 rounded-full border border-[#BDE0FE]">
            PPGF Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(stats?.beneficiaries || []).map((b) => (
            <div key={b.beneficiary_id} className="bg-white rounded-2xl border border-[#DDE3EA] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#0070E0] bg-[#E5F2FC] px-2 py-0.5 rounded-full border border-[#BDE0FE]">
                    {b.category}
                  </span>
                  <span className="text-xs font-bold text-[#536477]">{b.donor_count} donors</span>
                </div>
                <h3 className="text-sm font-extrabold text-[#001435] mt-2.5">{b.name}</h3>
                <p className="text-xs text-[#536477] mt-1">
                  Total Disbursed: <strong className="text-[#003087]">₹{b.total_received.toLocaleString()}</strong>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DDE3EA]">
                <div className="flex justify-between text-[11px] font-bold mb-1 text-[#536477]">
                  <span>Share of Pool</span>
                  <span>{b.percentage_of_total}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#0070E0] to-[#003087] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(10, b.percentage_of_total))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Redemption & Optional Donation Panel */}
      <div id="redemption-panel">
        <DonationPanel
          customerId={currentUser?.id || "user-cust-a-001"}
          onDonationSuccess={loadStats}
          standalone={true}
        />
      </div>

      {/* AG Grid Real-Time Verified Donation Ledger */}
      <div>
        <AGGridTable
          title="Real-Time Verified Donation Ledger"
          subtitle="Live auditable record of all completed reward contributions with cryptographic reference IDs"
          rowData={stats?.recent_donations || []}
          columnDefs={columnDefs}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
}
