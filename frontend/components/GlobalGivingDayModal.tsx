"use client";

import React, { useState } from "react";
import {
  Globe2,
  Heart,
  CheckCircle2,
  X,
  Sparkles,
  Vote,
} from "lucide-react";

interface GlobalGivingDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToRewardsForGood: () => void;
}

export default function GlobalGivingDayModal({
  isOpen,
  onClose,
  onGoToRewardsForGood,
}: GlobalGivingDayModalProps) {
  const [selectedCause, setSelectedCause] = useState<string>("hunger");
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  if (!isOpen) return null;

  const causes = [
    { id: "hunger", name: "Food & Hunger Relief", icon: "🍲", desc: "School meals & food pantries" },
    { id: "shelter", name: "Shelter & Blankets", icon: "🏠", desc: "Emergency night shelters" },
    { id: "education", name: "Children's Education", icon: "📚", desc: "Books & school supplies" },
    { id: "medical", name: "Medical Assistance", icon: "🩺", desc: "Mobile clinics & first-aid" },
    { id: "disaster", name: "Emergency Relief", icon: "🚨", desc: "Rapid disaster response" },
    { id: "water", name: "Clean Water", icon: "💧", desc: "Clean water filtration" },
  ];

  const handleCastVote = () => {
    setHasVoted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#001435]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full border border-[#DDE3EA] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 duration-200">
        {/* Header */}
        <div className="bg-[#003087] p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-1.5 mb-1.5">
            <span className="bg-[#FFC439] text-[#001435] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Corporate Giving
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight">PayPal Giving Day</h2>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            100% of PayPal's platform earnings today are donated to verified causes — at $0 cost to you.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Cause Voting Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-extrabold text-[#001435] flex items-center gap-1.5 uppercase tracking-wider">
                <Vote className="w-3.5 h-3.5 text-rose-500" />
                <span>Vote for a Cause</span>
              </h3>
              {hasVoted && (
                <span className="bg-[#EBF9F1] text-[#00875A] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Voted!
                </span>
              )}
            </div>

            <div className="space-y-2">
              {causes.map((c) => {
                const isSelected = selectedCause === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedCause(c.id); setHasVoted(false); }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                      isSelected
                        ? "bg-[#E5F2FC] border-[#0070E0] shadow-2xs"
                        : "bg-white border-[#E5E9EE] hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl shrink-0">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-[#001435]">{c.name}</p>
                      <p className="text-[11px] text-[#8B95A5] truncate">{c.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#0070E0] flex items-center justify-center text-white shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={handleCastVote}
                disabled={hasVoted}
                className={`w-full py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                  hasVoted
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#003087] hover:bg-[#002060] text-white shadow-xs"
                }`}
              >
                {hasVoted ? "Vote Recorded — Thank You!" : "Cast My Cause Vote"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F5F7FA] px-4 py-3 border-t border-[#E5E9EE] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#8B95A5] hover:text-[#001435] cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onGoToRewardsForGood(); }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-[#0070E0] hover:bg-[#005bb5] text-white shadow-xs cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
            <span>Donate Rewards</span>
          </button>
        </div>
      </div>
    </div>
  );
}
