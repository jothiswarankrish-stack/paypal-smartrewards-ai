"use client";

import React from "react";
import { User } from "../types";
import { Utensils, Car, ShoppingBag, Apple, Plane, Store, ShieldAlert, Sparkles } from "lucide-react";

interface DemoPersonaBarProps {
  currentPersona: string;
  onSelectPersona: (personaKey: string) => void;
  currentUser: User | null;
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
      label: "Customer A: Foodie",
      sub: "Swiggy ₹6k / Taxi ₹3k",
      icon: Utensils,
      color: "bg-orange-500",
      border: "border-orange-500",
      activeText: "text-orange-700 bg-orange-50",
    },
    {
      key: "customer_b",
      label: "Customer B: Commuter",
      sub: "Taxi ₹7k / Cab bias",
      icon: Car,
      color: "bg-blue-600",
      border: "border-blue-600",
      activeText: "text-blue-700 bg-blue-50",
    },
    {
      key: "customer_c",
      label: "Customer C: Shopper",
      sub: "Shopping ₹8k / Fashion",
      icon: ShoppingBag,
      color: "bg-purple-600",
      border: "border-purple-600",
      activeText: "text-purple-700 bg-purple-50",
    },
    {
      key: "customer_d",
      label: "Customer D: Groceries",
      sub: "Pantry ₹6.5k / Blinkit",
      icon: Apple,
      color: "bg-emerald-600",
      border: "border-emerald-600",
      activeText: "text-emerald-700 bg-emerald-50",
    },
    {
      key: "customer_e",
      label: "Customer E: Travel",
      sub: "MMT & Cinema ₹7.5k",
      icon: Plane,
      color: "bg-teal-600",
      border: "border-teal-600",
      activeText: "text-teal-700 bg-teal-50",
    },
    {
      key: "merchant",
      label: "Merchant Portal",
      sub: "FreshBite Partner",
      icon: Store,
      color: "bg-indigo-600",
      border: "border-indigo-600",
      activeText: "text-indigo-700 bg-indigo-50",
    },
    {
      key: "admin",
      label: "Admin Center",
      sub: "Platform Audit",
      icon: ShieldAlert,
      color: "bg-slate-800",
      border: "border-slate-800",
      activeText: "text-slate-900 bg-slate-100",
    },
  ];

  return (
    <div className="bg-slate-900 text-white px-4 py-2.5 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>1-Click Hackathon Persona Switcher:</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden xl:inline">
            Each profile has 30 days of distinct synthetic transactions & AI recommendations.
          </span>
        </div>

        {/* Persona Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = currentPersona === p.key;
            return (
              <button
                key={p.key}
                onClick={() => onSelectPersona(p.key)}
                disabled={isLoading}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-white text-slate-950 font-bold shadow-md ring-2 ring-blue-400 scale-[1.02]"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                <span>{p.label}</span>
                <span className={`text-[10px] hidden sm:inline px-1 py-0.2 rounded font-normal ${isSelected ? "text-slate-600" : "text-slate-400"}`}>
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
