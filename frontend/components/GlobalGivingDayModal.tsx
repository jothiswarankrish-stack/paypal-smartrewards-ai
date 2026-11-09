"use client";

import React, { useState } from "react";
import {
  Globe2,
  Heart,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  BarChart3,
  HelpCircle,
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
    { id: "hunger", name: "Food & Hunger Relief", icon: "🍲", desc: "Midday hot meals for school children & food pantries", votes: 42100 },
    { id: "shelter", name: "Homeless Shelter & Blankets", icon: "🏠", desc: "Emergency night shelters & winter care kits", votes: 31400 },
    { id: "education", name: "Children's STEM Education", icon: "📚", desc: "Digital tablets & books for rural classrooms", votes: 28900 },
    { id: "medical", name: "Medical Assistance", icon: "🩺", desc: "Mobile clinics, first-aid and pediatric health checks", votes: 19800 },
    { id: "disaster", name: "Disaster Emergency Relief", icon: "🚨", desc: "Rapid response food, shelter and hygiene kits", votes: 15400 },
    { id: "water", name: "Clean Water & Sanitation", icon: "💧", desc: "Solar-powered well filtration & community taps", votes: 12600 },
    { id: "climate", name: "Environmental Protection", icon: "🌱", desc: "Mangrove restoration & urban afforestation", votes: 9400 },
  ];

  const handleCastVote = () => {
    setHasVoted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#DDE3EA] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#001435] via-[#003087] to-[#0070E0] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-[#FFC439] text-[#001435] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" /> OFFICIAL CSR INITIATIVE
            </span>
            <span className="text-blue-200 text-xs">• 100% Corporate Contribution</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">PayPal Global Giving Day</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl leading-relaxed">
            Turning Everyday Digital Payments into Global Social Impact — without charging customers or merchants an extra penny.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: The Core Idea */}
          <div className="bg-[#F5F7FA] border border-[#DDE3EA] rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-[#001435] flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#0070E0]" />
              How Global Giving Day Works
            </h3>
            <p className="text-xs text-[#536477] mt-2 leading-relaxed">
              On this designated day, PayPal voluntarily commits a defined portion—up to <strong>100% of its eligible platform earnings</strong>—from
              commercial transactions processed to certified global charitable causes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#DDE3EA]">
                <p className="font-extrabold text-[#003087]">1. Customers Shop</p>
                <p className="text-[#536477] mt-1 text-[11px]">
                  Pay as usual. Zero donation fee, zero round-up surcharge.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#DDE3EA]">
                <p className="font-extrabold text-[#003087]">2. Merchants Receive</p>
                <p className="text-[#536477] mt-1 text-[11px]">
                  Settled under normal terms. Zero extra deduction from business payouts.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#DDE3EA]">
                <p className="font-extrabold text-[#00875A]">3. PayPal Gives</p>
                <p className="text-[#536477] mt-1 text-[11px]">
                  100% corporate funded from transaction margins via PayPal Giving Fund.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Public Cause Voting (Democratized Giving) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#001435] flex items-center gap-2">
                  <Vote className="w-4 h-4 text-rose-500" />
                  Democratized Cause Voting
                </h3>
                <p className="text-xs text-[#536477]">
                  Vote to direct where PayPal's corporate donation pool should be allocated today:
                </p>
              </div>
              {hasVoted && (
                <span className="bg-[#EBF9F1] text-[#00875A] border border-[#A3E9C4] text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Vote Recorded!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {causes.map((c) => {
                const isSelected = selectedCause === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedCause(c.id); setHasVoted(false); }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? "bg-[#E5F2FC] border-[#0070E0] shadow-2xs"
                        : "bg-white border-[#DDE3EA] hover:border-gray-400"
                    }`}
                  >
                    <span className="text-xl shrink-0">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-[#001435]">{c.name}</p>
                        <span className="text-[10px] text-[#536477] font-bold">{(c.votes + (isSelected && hasVoted ? 1 : 0)).toLocaleString()} votes</span>
                      </div>
                      <p className="text-[11px] text-[#536477] mt-0.5 line-clamp-1">{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCastVote}
                disabled={hasVoted}
                className={`px-5 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                  hasVoted
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#003087] hover:bg-[#002266] text-white shadow-xs"
                }`}
              >
                {hasVoted ? "Thank You for Voting!" : "Cast My Cause Vote"}
              </button>
            </div>
          </div>

          {/* Section 3: Live Public Transparency Dashboard Snapshot */}
          <div className="bg-[#001435] text-white rounded-2xl p-5 border border-[#002244]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-[#FFC439]" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Audited Transparency Dashboard (Live Snapshot)
                </h4>
              </div>
              <span className="text-[10px] text-blue-200">Independent Auditor: Deloitte LLP</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center">
              <div>
                <p className="text-[10px] text-blue-200 font-bold uppercase">Eligible Volume</p>
                <p className="text-base font-black text-white mt-1">$1.24 Billion</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-200 font-bold uppercase">Take Rate Revenue</p>
                <p className="text-base font-black text-white mt-1">$24.8 Million</p>
              </div>
              <div>
                <p className="text-[10px] text-[#FFC439] font-bold uppercase">Corporate Pledge</p>
                <p className="text-base font-black text-[#FFC439] mt-1">$18.6 Million</p>
              </div>
              <div>
                <p className="text-[10px] text-green-300 font-bold uppercase">Verified Disbursed</p>
                <p className="text-base font-black text-green-400 mt-1">$14.2 Million</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
              <span>Rule: Never describe a donation as completed until the recipient has actually received the funds.</span>
              <span className="text-white font-bold">76.3% Settled</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F5F7FA] px-6 py-4 border-t border-[#DDE3EA] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#536477]">
            Want to also contribute a portion of your personal rewards?
          </p>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#536477] hover:text-[#001435]"
            >
              Close
            </button>
            <button
              onClick={() => { onClose(); onGoToRewardsForGood(); }}
              className="flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-extrabold bg-[#0070E0] hover:bg-[#005bb5] text-white shadow-xs cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
              <span>Go to Rewards for Good</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
