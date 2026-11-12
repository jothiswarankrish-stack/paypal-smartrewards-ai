"use client";

import React, { useState } from "react";
import { Heart, Sparkles, ArrowRight, X } from "lucide-react";

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
    <div className="bg-[#FFC439] text-[#001435] px-3.5 py-2 flex items-center justify-between text-xs border-b border-[#F2B82E]">
      <div
        onClick={onOpenGivingDayModal}
        className="flex items-center space-x-2 flex-1 cursor-pointer truncate mr-2"
      >
        <span className="w-5 h-5 rounded-full bg-[#003087] text-[#FFC439] flex items-center justify-center shrink-0">
          <Heart className="w-3 h-3 fill-[#FFC439]" />
        </span>
        <span className="font-extrabold truncate text-[11px]">
          Giving Day: PayPal donates 100% of fees today
        </span>
      </div>

      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          onClick={onNavigateToGivingTab}
          className="text-[10px] font-black bg-[#003087] text-white px-2.5 py-0.5 rounded-full hover:bg-[#002060] transition-colors cursor-pointer"
        >
          View
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-[#001435]/60 hover:text-[#001435] p-0.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
