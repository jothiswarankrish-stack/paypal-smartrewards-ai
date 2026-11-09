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
  toggleAgent,
  isAgentOpen,
}: NavbarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "recommendations", label: "AI Rewards", icon: Sparkles, badge: "Personalized" },
    { id: "marketplace", label: "Coupons", icon: Ticket },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "merchant", label: "Merchant Portal", icon: Store },
    { id: "admin", label: "Admin Operations", icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#DDE3EA] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center">
          {/* Logo & Brand: Recognizable PayPal Identity */}
          <div
            className="flex items-center space-x-3 cursor-pointer py-1"
            onClick={() => setActiveTab("dashboard")}
          >
            {/* PayPal Double-P Inspired Monogram */}
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003087] via-[#0070E0] to-[#009CDE] flex items-center justify-center text-white font-black text-xl shadow-xs">
                <span className="italic font-extrabold tracking-tighter">P</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5 leading-none">
                <span className="font-extrabold text-[#003087] text-xl tracking-tight">PayPal</span>
                <span className="font-bold text-[#0070E0] text-xl tracking-tight">SmartRewards</span>
                <span className="bg-[#E5F2FC] text-[#0070E0] border border-[#BDE0FE] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">
                  AI 2026
                </span>
              </div>
              <p className="text-[11px] text-[#536477] font-medium mt-1">
                Personalized Financial Benefits & Sandbox Checkout
              </p>
            </div>
          </div>

          {/* Navigation Links (PayPal style) */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#003087] text-white shadow-xs"
                      : "text-[#536477] hover:text-[#001435] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#536477]"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                        isActive
                          ? "bg-[#0070E0] text-white"
                          : "bg-[#E5F2FC] text-[#0070E0]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: AI Shopping Copilot Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleAgent}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                isAgentOpen
                  ? "bg-[#0070E0] text-white border-[#0070E0] shadow-sm ring-2 ring-[#009CDE]/40"
                  : "bg-[#F0F7FD] text-[#003087] border-[#DDE3EA] hover:bg-[#E5F2FC] hover:border-[#0070E0]"
              }`}
            >
              <Bot className={`w-4 h-4 ${isAgentOpen ? "text-white animate-pulse" : "text-[#0070E0]"}`} />
              <span className="hidden sm:inline">AI Shopping Copilot</span>
              <span className="bg-[#009CDE] text-white text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase">
                Agentic
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
