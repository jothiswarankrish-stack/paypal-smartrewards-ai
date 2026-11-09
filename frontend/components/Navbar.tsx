"use client";

import React from "react";
import { Sparkles, Bot, Shield, Store, LayoutDashboard, Ticket, BarChart3 } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  toggleAgent: () => void;
  isAgentOpen: boolean;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  toggleAgent,
  isAgentOpen,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#003087] via-[#0079C1] to-[#00CF92] flex items-center justify-center text-white font-black text-xl shadow-md">
              P
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">PayPal</span>
                <span className="font-bold text-[#0079C1] text-lg">SmartRewards</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Personalized AI Discounts & Sandbox Checkout</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Insights</span>
            </button>

            <button
              onClick={() => setActiveTab("recommendations")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "recommendations"
                  ? "bg-[#0079C1] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Recommendations</span>
            </button>

            <button
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "marketplace"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Coupons</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "analytics"
                  ? "bg-purple-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-300" />
              <span>AG Grid Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("merchant")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "merchant"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Merchant Portal</span>
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "admin"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Shield className="w-4 h-4 text-rose-400" />
              <span>Admin Operations</span>
            </button>
          </nav>

          {/* Right Action: Agentic Commerce Copilot Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleAgent}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border ${
                isAgentOpen
                  ? "bg-amber-400 text-slate-900 border-amber-500 shadow-md ring-2 ring-amber-300/50"
                  : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Bot className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">AI Shopping Copilot</span>
              <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                Agentic
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
