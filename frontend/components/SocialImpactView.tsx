"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Globe2,
  Sparkles,
  TrendingUp,
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
        headerName: "Ref ID",
        width: 130,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs font-bold text-[#003087]">
            {params.value}
          </span>
        ),
      },
      {
        field: "customer_name",
        headerName: "Donor",
        width: 120,
        cellRenderer: (params: any) => (
          <span className="font-semibold text-xs text-[#001435]">
            {params.value}
          </span>
        ),
      },
      {
        field: "beneficiary_name",
        headerName: "Beneficiary",
        width: 160,
        cellRenderer: (params: any) => (
          <span className="font-medium text-xs text-[#001435] flex items-center gap-1 truncate">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
            <span className="truncate">{params.value}</span>
          </span>
        ),
      },
      {
        field: "amount",
        headerName: "Amount",
        width: 90,
        cellRenderer: (params: any) => (
          <span className="font-bold text-xs text-rose-600">
            ₹{Number(params.value || 0).toFixed(0)}
          </span>
        ),
      },
    ];
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Mobile Hero Header */}
      <div className="bg-gradient-to-br from-[#003087] via-[#0048A8] to-[#0070E0] rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center space-x-1.5 mb-2">
          <span className="bg-[#FFC439] text-[#001435] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> REWARDS FOR GOOD
          </span>
        </div>

        <h1 className="text-xl font-black tracking-tight text-white">
          Turn Rewards into Real Impact
        </h1>

        <p className="text-xs text-blue-100 mt-1.5 leading-relaxed">
          PayPal donates 100% of platform earnings today. You can also voluntarily convert your shopping points into charity contributions.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onOpenGivingDayModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-[#FFC439] hover:bg-[#F2BA36] text-[#001435] shadow-xs cursor-pointer"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#001435]" />
            <span>Vote on Causes</span>
          </button>
        </div>
      </div>

      {/* Impact Stats Counters (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl border border-[#E5E9EE] p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider block">
            Total Given
          </span>
          <p className="text-lg font-black text-[#001435] mt-0.5">
            ₹{(stats?.total_donated || 36825).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#00875A] font-bold flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="w-3 h-3" /> Verified Ledger
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E9EE] p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider block">
            Total Donors
          </span>
          <p className="text-lg font-black text-[#001435] mt-0.5">
            {(stats?.total_donors_count || 718).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#536477] mt-0.5 block">
            Across cohorts
          </span>
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

      {/* Beneficiary Cause Breakdown Cards */}
      <div>
        <h3 className="text-xs font-extrabold text-[#001435] uppercase tracking-wider mb-2 px-1">
          Supported Causes
        </h3>

        <div className="space-y-2">
          {(stats?.beneficiaries || []).slice(0, 3).map((b) => (
            <div key={b.beneficiary_id} className="bg-white rounded-2xl border border-[#E5E9EE] p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-[#0070E0] bg-[#E5F2FC] px-2 py-0.5 rounded-full">
                  {b.category}
                </span>
                <span className="text-[10px] font-bold text-[#8B95A5]">{b.donor_count} donors</span>
              </div>
              <h4 className="text-xs font-extrabold text-[#001435] mt-1.5">{b.name}</h4>
              <p className="text-[11px] text-[#536477] mt-0.5">
                Disbursed: <strong className="text-[#003087]">₹{b.total_received.toLocaleString()}</strong> ({b.percentage_of_total}%)
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AG Grid Real-Time Verified Donation Ledger */}
      <div>
        <AGGridTable
          title="Verified Donation Log"
          subtitle="Real-time record of all completed reward contributions"
          rowData={stats?.recent_donations || []}
          columnDefs={columnDefs}
          paginationPageSize={5}
        />
      </div>
    </div>
  );
}
