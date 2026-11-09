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
    { field: "transaction_id", headerName: "TX ID", width: 110, cellClass: "font-mono" },
    { field: "customer_name", headerName: "Customer", width: 150, cellClass: "font-bold text-[#001435]" },
    { field: "merchant", headerName: "Merchant Partner", width: 160 },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      cellRenderer: (params: any) => {
        return (
          <span className="font-bold text-[#003087] bg-[#F0F7FD] border border-[#BDE0FE] px-2 py-0.5 rounded-full text-xs">
            {params.value}
          </span>
        );
      },
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 130,
      valueFormatter: (p: any) => `₹${p.value?.toFixed(2)}`,
      cellClass: "font-bold font-mono text-[#001435]",
    },
    { field: "channel", headerName: "Payment Method", width: 140 },
    { field: "date", headerName: "Timestamp", width: 150, cellClass: "text-[#536477]" },
    {
      field: "is_synthetic",
      headerName: "Data Provenance",
      width: 140,
      cellRenderer: (params: any) => {
        const isLive = params.value === "Live Verified";
        return (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isLive ? "bg-[#E3FCEF] text-[#00875A]" : "bg-[#F5F7FA] text-[#536477] border border-[#DDE3EA]"
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
    { field: "code", headerName: "Promo Code", width: 150, cellClass: "font-mono font-bold text-[#003087]" },
    { field: "title", headerName: "Offer Title", flex: 2, cellClass: "font-medium text-[#001435]" },
    { field: "merchant", headerName: "Merchant Partner", width: 160 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "discount", headerName: "Discount Value", width: 130, cellClass: "text-[#00875A] font-bold" },
    {
      field: "min_purchase",
      headerName: "Min Spend",
      width: 120,
      valueFormatter: (p: any) => `₹${p.value}`,
    },
    { field: "redemptions", headerName: "Redeemed", width: 110, cellClass: "font-bold text-[#001435]" },
    {
      field: "utilization_pct",
      headerName: "Utilization",
      width: 120,
      valueFormatter: (p: any) => `${p.value}%`,
      cellClass: "font-bold text-[#0070E0]",
    },
    {
      field: "status",
      headerName: "Campaign Status",
      width: 120,
      cellRenderer: (p: any) => (
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${p.value === "Active" ? "bg-[#E3FCEF] text-[#00875A]" : "bg-[#F5F7FA] text-[#536477]"}`}>
          {p.value}
        </span>
      ),
    },
  ];

  // 3. Column Definitions for Verified Redemptions
  const redemptionsColumns: ColDef[] = [
    { field: "redemption_id", headerName: "Redemption ID", width: 140, cellClass: "font-mono font-bold" },
    { field: "customer", headerName: "Customer Name", width: 150, cellClass: "text-[#001435] font-semibold" },
    { field: "coupon_code", headerName: "Promo Code", width: 150, cellClass: "font-mono font-bold text-[#003087]" },
    { field: "category", headerName: "Category", width: 130 },
    {
      field: "amount_saved",
      headerName: "Verified Savings",
      width: 140,
      valueFormatter: (p: any) => `+₹${p.value?.toFixed(2)}`,
      cellClass: "text-[#00875A] font-bold font-mono",
    },
    { field: "capture_id", headerName: "PayPal Capture ID", flex: 1, cellClass: "font-mono text-xs text-[#0070E0]" },
    { field: "redeemed_at", headerName: "Verified Date", width: 150, cellClass: "text-[#536477]" },
  ];

  // 4. Column Definitions for Merchants
  const merchantsColumns: ColDef[] = [
    { field: "business_name", headerName: "Merchant Brand", width: 190, cellClass: "font-bold text-[#001435]" },
    { field: "category", headerName: "Industry Vertical", width: 150 },
    { field: "active_offers", headerName: "Active Offers", width: 130, cellClass: "font-bold text-[#0070E0]" },
    { field: "total_redemptions", headerName: "Redemptions", width: 140, cellClass: "font-bold text-[#00875A]" },
    { field: "commission_rate", headerName: "Commission", width: 120 },
    { field: "joined_date", headerName: "Partner Since", width: 130, cellClass: "text-[#536477]" },
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Suite Tabs (PayPal Design Style) */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-[#DDE3EA] shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("spending")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeTab === "spending"
              ? "bg-[#003087] text-white shadow-xs"
              : "text-[#536477] hover:text-[#001435] hover:bg-[#F5F7FA]"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Customer Spending Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab("coupons")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeTab === "coupons"
              ? "bg-[#003087] text-white shadow-xs"
              : "text-[#536477] hover:text-[#001435] hover:bg-[#F5F7FA]"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Coupon Performance & Caps</span>
        </button>

        <button
          onClick={() => setActiveTab("redemptions")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeTab === "redemptions"
              ? "bg-[#003087] text-white shadow-xs"
              : "text-[#536477] hover:text-[#001435] hover:bg-[#F5F7FA]"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Verified Redemptions Audit</span>
        </button>

        <button
          onClick={() => setActiveTab("merchants")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeTab === "merchants"
              ? "bg-[#003087] text-white shadow-xs"
              : "text-[#536477] hover:text-[#001435] hover:bg-[#F5F7FA]"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Merchant Ecosystem</span>
        </button>
      </div>

      {isLoading && (
        <div className="p-16 text-center text-[#536477]">
          <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#0070E0] mb-2" />
          <p className="text-xs font-semibold">Loading database records into AG Grid...</p>
        </div>
      )}

      {/* Selected AG Grid Table */}
      {!isLoading && activeTab === "spending" && (
        <AGGridTable
          title="Customer Transaction & Spending Ledger"
          subtitle="30-day customer transaction records used as training inputs for machine learning"
          rowData={spendingRows}
          columnDefs={spendingColumns}
          paginationPageSize={10}
        />
      )}

      {!isLoading && activeTab === "coupons" && (
        <AGGridTable
          title="Merchant Coupon Inventory & Utilization"
          subtitle="Redemption velocity, caps, minimum spend rules and active status"
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
