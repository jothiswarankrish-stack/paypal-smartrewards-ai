"use client";

import React from "react";
import { Utensils, Car, ShoppingBag, Apple, Plane, Store, ShieldAlert, Sparkles, ChevronRight } from "lucide-react";
import { User } from "../types";

interface DemoPersonaBarProps {
  currentPersona: string;
  onSelectPersona: (personaKey: string) => void;
  currentUser?: User | null;
  isLoading: boolean;
}

export default function DemoPersonaBar({
  currentPersona,
  onSelectPersona,
  currentUser,
  isLoading,
}: DemoPersonaBarProps) {
  const personas = [
    {
      key: "customer_a",
      name: "Ananya S.",
      label: "Customer A",
      category: "Food Delivery",
      highlight: "₹6,000 / mo Swiggy",
      topMerchant: "Swiggy Gourmet",
      icon: Utensils,
      color: "bg-orange-500",
      accent: "text-orange-600",
    },
    {
      key: "customer_b",
      name: "Rohan V.",
      label: "Customer B",
      category: "Taxi & Commute",
      highlight: "₹7,000 / mo Uber",
      topMerchant: "Uber Premier",
      icon: Car,
      color: "bg-[#0070E0]",
      accent: "text-[#0070E0]",
    },
    {
      key: "customer_c",
      name: "Priya N.",
      label: "Customer C",
      category: "Fashion & Shop",
      highlight: "₹8,000 / mo Myntra",
      topMerchant: "Myntra Clearance",
      icon: ShoppingBag,
      color: "bg-purple-600",
      accent: "text-purple-600",
    },
    {
      key: "customer_d",
      name: "Rajesh K.",
      label: "Customer D",
      category: "Daily Grocery",
      highlight: "₹6,500 / mo Blinkit",
      topMerchant: "Blinkit SuperSaver",
      icon: Apple,
      color: "bg-[#00875A]",
      accent: "text-[#00875A]",
    },
    {
      key: "customer_e",
      name: "Sneha P.",
      label: "Customer E",
      category: "Travel & Hotels",
      highlight: "₹7,500 / mo MMT",
      topMerchant: "MakeMyTrip Flights",
      icon: Plane,
      color: "bg-teal-600",
      accent: "text-teal-600",
    },
    {
      key: "merchant",
      name: "Merchant Portal",
      label: "Partner",
      category: "Swiggy Business",
      highlight: "Campaign Manager",
      topMerchant: "Partner Hub",
      icon: Store,
      color: "bg-[#003087]",
      accent: "text-[#003087]",
    },
    {
      key: "admin",
      name: "Admin Audit",
      label: "Operations",
      category: "Telemetry & Logs",
      highlight: "Reset & Telemetry",
      topMerchant: "Ops Ledger",
      icon: ShieldAlert,
      color: "bg-slate-700",
      accent: "text-slate-700",
    },
  ];

  const activePersonaObj = personas.find((p) => p.key === currentPersona) || personas[0];
  const ActiveIcon = activePersonaObj.icon;

  return (
    <div className="bg-white border-b border-[#E5E9EE]">
      {/* 1. Horizontal Demo User Pills */}
      <div className="px-3 pt-2.5 pb-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto hide-scrollbar py-0.5">
          <span className="text-[10px] font-black text-[#8B95A5] uppercase tracking-wider whitespace-nowrap pr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#0070E0]" />
            <span>Profile:</span>
          </span>
          {personas.map((p) => {
            const isSelected = currentPersona === p.key;
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                onClick={() => onSelectPersona(p.key)}
                disabled={isLoading}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#003087] text-white shadow-xs ring-2 ring-[#0070E0]/30 scale-102"
                    : "bg-[#F5F7FA] text-[#001435] hover:bg-[#EBF3FB] border border-[#E5E9EE]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isSelected ? "bg-white text-[#003087]" : `${p.color} text-white`
                  }`}
                >
                  <Icon className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-extrabold">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Self-Explanatory Profile Context Strip */}
      <div className="px-3 py-1.5 bg-[#F0F7FD] border-t border-[#E1EAF4] flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-2 truncate">
          <span className="font-extrabold text-[#003087] flex items-center gap-1 shrink-0">
            <ActiveIcon className="w-3 h-3 text-[#0070E0]" />
            <span>{activePersonaObj.category}</span>
          </span>
          <span className="text-[#8B95A5]">•</span>
          <span className="text-[#536477] font-semibold truncate">
            {activePersonaObj.highlight}
          </span>
        </div>

        <span className="text-[10px] font-black text-[#0070E0] bg-white px-2 py-0.5 rounded-full border border-[#D5E6F5] shrink-0 ml-1">
          AI Target: {activePersonaObj.topMerchant}
        </span>
      </div>
    </div>
  );
}
