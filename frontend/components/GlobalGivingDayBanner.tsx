"use client";

import React, { useState } from "react";
import { Heart, Globe2, Sparkles, ArrowRight, ShieldCheck, Info } from "lucide-react";

interface GlobalGivingDayBannerProps {
  onOpenGivingDayModal: () => void;
  onNavigateToGivingTab: () => void;
}

export default function GlobalGivingDayBanner({
  onOpenGivingDayModal,
  onNavigateToGivingTab,
}: GlobalGivingDayBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#001435] via-[#003087] to-[#0070E0] text-white shadow-md border-b border-[#002244]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Icon & Headline */}
          <div className="flex items-center space-x-3 text-left w-full md:w-auto">
            <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-[#FFC439] shrink-0 border border-white/20 shadow-xs">
              <Globe2 className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="bg-[#FFC439] text-[#001435] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" /> TODAY IS PAYPAL GLOBAL GIVING DAY
                </span>
                <span className="text-xs text-blue-200 hidden sm:inline">•</span>
                <span className="text-xs font-semibold text-white/95 hidden sm:inline">
                  100% of PayPal's Platform Earnings Today Dedicated to Verified Causes
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Every eligible payment you make triggers corporate giving at{" "}
                <strong className="text-white underline decoration-[#FFC439]">$0 additional cost</strong> to you or merchants.
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={onOpenGivingDayModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-xs transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>How It Works</span>
            </button>

            <button
              onClick={onNavigateToGivingTab}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-[#FFC439] hover:bg-[#F2BA36] text-[#001435] shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              <span>Rewards for Good</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-white/60 hover:text-white text-xs px-1.5 py-1 ml-1 cursor-pointer"
              title="Dismiss announcement"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
