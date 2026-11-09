"use client";

import React, { useState, useEffect } from "react";
import AGGridTable from "./AGGridTable";
import { ColDef } from "ag-grid-community";
import {
  getSpendingGrid,
  getCouponsGrid,
  getRedemptionsGrid,
  getMerchantsGrid,
} from "../lib/api";
import {
  BarChart3,
  Receipt,
  Ticket,
  Store,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function AnalyticsView() {
  const [activeTab, setActiveTab] = useState<"spending" | "coupons" | "redemptions" | "merchants">("spending");
  const [spendingRows, setSpendingRows] = useState<any[]>([]);
  const [couponsRows, setCouponsRows] = useState<any[]>([]);
  const [redemptionsRows, setRedemptionsRows] = useState<any[]>([]);
  const [merchantsRows, setMerchantsRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadActiveTabData(activeTab);
  }, [activeTab]);

  const loadActiveTabData = async (tab: string) => {
    setIsLoading(true);
    try {
      if (tab === "spending") {
        const data = await getSpendingGrid();
        setSpendingRows(data);
      } else if (tab === "coupons") {
        const data = await getCouponsGrid();
        setCouponsRows(data);
      } else if (tab === "redemptions") {
        const data = await getRedemptionsGrid();
        setRedemptionsRows(data);
      } else if (tab === "merchants") {
        const data = await getMerchantsGrid();
        setMerchantsRows(data);
      }
    } catch (err) {
      console.error("Failed to load AG Grid analytics dataset:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Column Definitions for Spending Grid
  const spendingColumns: ColDef[] = [
    { field: "transaction_id", headerName: "TX ID", width: 110 },
    { field: "customer_name", headerName: "Customer", width: 140 },
    { field: "merchant", headerName: "Merchant Partner", width: 150 },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      cellRenderer: (params: any) => {
        return (
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
            {params.value}
          </span>
        );
      },
    },
    {
      field: "amount",
      headerName: "Amount (INR)",
      width: 130,
      valueFormatter: (p: any) => `₹${p.value?.toFixed(2)}`,
    },
    { field: "channel", headerName: "Payment Channel", width: 130 },
    { field: "date", headerName: "Timestamp", width: 150 },
    {
      field: "is_synthetic",
      headerName: "Provenance",
      width: 130,
      cellRenderer: (params: any) => {
        const isLive = params.value === "Live Verified";
        return (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isLive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
            }`}
          >
            {params.value}
          </span>
        );
      },
    },
  ];

  // 2. Column Definitions for Coupons Performance Grid
  const couponsColumns: ColDef[] = [
    { field: "code", headerName: "Promo Code", width: 140, cellClass: "font-mono font-bold" },
    { field: "title", headerName: "Coupon Title", flex: 2 },
    { field: "merchant", headerName: "Merchant", width: 150 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "discount", headerName: "Discount Value", width: 120, cellClass: "text-emerald-600 font-bold" },
    {
      field: "min_purchase",
      headerName: "Min Order",
      width: 110,
      valueFormatter: (p: any) => `₹${p.value}`,
    },
    { field: "redemptions", headerName: "Redeemed", width: 110 },
    {
      field: "utilization_pct",
      headerName: "Utilization",
      width: 120,
      valueFormatter: (p: any) => `${p.value}%`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      cellRenderer: (p: any) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.value === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
          {p.value}
        </span>
      ),
    },
  ];

  // 3. Column Definitions for Verified Redemptions
  const redemptionsColumns: ColDef[] = [
    { field: "redemption_id", headerName: "Redemption ID", width: 130 },
    { field: "customer", headerName: "Customer Name", width: 150 },
    { field: "coupon_code", headerName: "Coupon Code", width: 140, cellClass: "font-mono font-bold" },
    { field: "category", headerName: "Category", width: 130 },
    {
      field: "amount_saved",
      headerName: "Amount Saved",
      width: 130,
      valueFormatter: (p: any) => `₹${p.value?.toFixed(2)}`,
      cellClass: "text-emerald-600 font-bold",
    },
    { field: "capture_id", headerName: "PayPal Capture ID", flex: 1, cellClass: "font-mono text-xs" },
    { field: "redeemed_at", headerName: "Verified Date", width: 150 },
  ];

  // 4. Column Definitions for Merchants
  const merchantsColumns: ColDef[] = [
    { field: "business_name", headerName: "Merchant Brand", width: 180, cellClass: "font-bold" },
    { field: "category", headerName: "Industry Vertical", width: 150 },
    { field: "active_offers", headerName: "Active Offers", width: 130 },
    { field: "total_redemptions", headerName: "Total Redemptions", width: 150 },
    { field: "commission_rate", headerName: "Take Rate", width: 120 },
    { field: "joined_date", headerName: "Partner Since", width: 130 },
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Suite Navigation Pills */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("spending")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "spending"
              ? "bg-[#003087] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Customer Spending Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab("coupons")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "coupons"
              ? "bg-[#003087] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Coupon Performance & Caps</span>
        </button>

        <button
          onClick={() => setActiveTab("redemptions")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "redemptions"
              ? "bg-[#003087] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Verified Redemptions Audit</span>
        </button>

        <button
          onClick={() => setActiveTab("merchants")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "merchants"
              ? "bg-[#003087] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Merchant Ecosystem</span>
        </button>
      </div>

      {isLoading && (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0079C1] mb-2" />
          <p className="text-xs font-medium">Fetching real database records for AG Grid...</p>
        </div>
      )}

      {/* Render selected AG Grid table */}
      {!isLoading && activeTab === "spending" && (
        <AGGridTable
          title="Customer Transaction & Spending Ledger"
          subtitle="Real-time 30-day transaction records used as training inputs for machine learning"
          rowData={spendingRows}
          columnDefs={spendingColumns}
          paginationPageSize={10}
        />
      )}

      {!isLoading && activeTab === "coupons" && (
        <AGGridTable
          title="Merchant Coupon Inventory & Utilization"
          subtitle="Redemption velocity, caps, minimum purchase constraints and availability"
          rowData={couponsRows}
          columnDefs={couponsColumns}
          paginationPageSize={10}
        />
      )}

      {!isLoading && activeTab === "redemptions" && (
        <AGGridTable
          title="Verified PayPal Redemptions Audit Trail"
          subtitle="Confirmed transactions linking PayPal Capture IDs to customer savings"
          rowData={redemptionsRows}
          columnDefs={redemptionsColumns}
          paginationPageSize={10}
        />
      )}

      {!isLoading && activeTab === "merchants" && (
        <AGGridTable
          title="Merchant Partner Ecosystem Metrics"
          subtitle="Campaign volume, active reward offers and partner transaction stats"
          rowData={merchantsRows}
          columnDefs={merchantsColumns}
          paginationPageSize={10}
        />
      )}
    </div>
  );
}
