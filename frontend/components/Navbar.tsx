"use client";

import React from "react";
import {
  Home,
  Sparkles,
  Ticket,
  Heart,
  Menu,
  Bot,
} from "lucide-react";
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
  const tabs = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "recommendations", label: "Rewards", icon: Sparkles },
    { id: "marketplace", label: "Deals", icon: Ticket },
    { id: "giving_day", label: "Giving", icon: Heart },
    { id: "more", label: "More", icon: Menu },
  ];

  return (
    <>
      {/* Fixed Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white border-t border-[#E5E9EE] shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.id === "more"
                ? ["analytics", "merchant", "admin", "more"].includes(activeTab)
                : activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "more") {
                    setActiveTab("analytics");
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? "text-[#003087]"
                    : "text-[#8B95A5]"
                }`}
              >
                <div className={`relative ${isActive ? "scale-110" : ""} transition-transform`}>
                  <Icon
                    className={`w-[22px] h-[22px] ${
                      isActive ? "text-[#003087]" : "text-[#8B95A5]"
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {tab.id === "recommendations" && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-[#0070E0] rounded-full" />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-semibold ${
                    isActive ? "text-[#003087] font-bold" : "text-[#8B95A5]"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-5 h-[3px] bg-[#003087] rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating AI Copilot Button */}
      <button
        onClick={toggleAgent}
        className={`fixed z-50 right-4 shadow-lg transition-all duration-300 ${
          isAgentOpen
            ? "bottom-24 bg-[#003087] ring-2 ring-[#0070E0]/40"
            : "bottom-24 bg-[#0070E0] hover:bg-[#003087]"
        } w-14 h-14 rounded-full flex items-center justify-center`}
        style={{ right: "max(16px, calc(50% - 200px))" }}
      >
        <Bot
          className={`w-6 h-6 text-white ${isAgentOpen ? "animate-pulse" : ""}`}
        />
        {!isAgentOpen && (
          <span className="absolute -top-1 -right-1 bg-[#FFC439] text-[#001435] text-[8px] font-black px-1.5 py-0.5 rounded-full">
            AI
          </span>
        )}
      </button>
    </>
  );
}
