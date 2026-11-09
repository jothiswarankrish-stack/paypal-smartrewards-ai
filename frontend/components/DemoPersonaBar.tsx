"use client";

import React from "react";
import { Utensils, Car, ShoppingBag, Apple, Plane, Store, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

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
  isLoading,
}: DemoPersonaBarProps) {
  const personas = [
    {
      key: "customer_a",
      label: "Customer A",
      sub: "Foodie • ₹6k Swiggy",
      icon: Utensils,
      color: "text-orange-600",
    },
    {
      key: "customer_b",
      label: "Customer B",
      sub: "Commuter • ₹7k Uber",
      icon: Car,
      color: "text-[#0070E0]",
    },
    {
      key: "customer_c",
      label: "Customer C",
      sub: "Shopper • ₹8k Myntra",
      icon: ShoppingBag,
      color: "text-purple-600",
    },
    {
      key: "customer_d",
      label: "Customer D",
      sub: "Pantry • ₹6.5k Blinkit",
      icon: Apple,
      color: "text-[#00875A]",
    },
    {
      key: "customer_e",
      label: "Customer E",
      sub: "Travel • ₹7.5k MMT",
      icon: Plane,
      color: "text-teal-600",
    },
    {
      key: "merchant",
      label: "Merchant",
      sub: "FreshBite Partner",
      icon: Store,
      color: "text-[#003087]",
    },
    {
      key: "admin",
      label: "Admin",
      sub: "Ops & Audit",
      icon: ShieldAlert,
      color: "text-slate-700",
    },
  ];

  return (
    <div className="bg-[#FFFFFF] border-b border-[#DDE3EA] px-4 py-2.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1.5 bg-[#F0F7FD] text-[#003087] border border-[#BDE0FE] px-2.5 py-1 rounded-full text-[11px] font-bold">
            <UserCheck className="w-3.5 h-3.5 text-[#0070E0]" />
            <span>Demonstration Persona Switcher:</span>
          </div>
          <span className="text-[11px] text-[#536477] hidden xl:inline">
            Each profile has 30 days of distinct synthetic transactions & AI recommendations
          </span>
        </div>

        {/* Persona Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = currentPersona === p.key;
            return (
              <button
                key={p.key}
                onClick={() => onSelectPersona(p.key)}
                disabled={isLoading}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#003087] text-white shadow-xs ring-2 ring-[#0070E0]/30"
                    : "bg-[#F5F7FA] text-[#001435] hover:bg-[#EBF3FB] border border-[#DDE3EA]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : p.color}`} />
                <span>{p.label}</span>
                <span className={`text-[10px] hidden sm:inline font-normal ${isSelected ? "text-blue-100" : "text-[#536477]"}`}>
                  ({p.sub})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
