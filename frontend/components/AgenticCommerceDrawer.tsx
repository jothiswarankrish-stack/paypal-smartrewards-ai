"use client";

import React, { useState } from "react";
import { User, DealProposal, Coupon } from "../types";
import { sendAgentMessage } from "../lib/api";
import {
  Bot,
  X,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface AgenticCommerceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSelectCouponForCheckout: (coupon: Coupon) => void;
}

export default function AgenticCommerceDrawer({
  isOpen,
  onClose,
  currentUser,
  onSelectCouponForCheckout,
}: AgenticCommerceDrawerProps) {
  const [messages, setMessages] = useState<
    Array<{
      sender: "user" | "agent";
      text: string;
      deals?: DealProposal[];
      orderIntent?: any;
    }>
  >([
    {
      sender: "agent",
      text: "Hello! I am your SmartRewards AI Commerce Agent. Tell me what you'd like to buy or how much you want to spend (e.g., 'I want food for ₹500' or 'Get me a taxi discount') and I will find the optimal reward, calculate your net savings, and prepare a PayPal Sandbox checkout for your approval!",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "I want food for ₹500",
    "Find a taxi ride discount under ₹400",
    "Show shopping deals for ₹2000",
    "Save money on grocery essentials",
  ];

  const handleSendMessage = async (msgText: string) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg = { sender: "user" as const, text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await sendAgentMessage(textToSend, currentUser?.id);
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: response.reply,
          deals: response.suggested_deals,
          orderIntent: response.order_intent,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "I experienced an error analyzing available deals. Please try asking again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDeal = (deal: DealProposal) => {
    // Construct dummy coupon object to launch PayPal checkout modal
    const mockCoupon: Coupon = {
      id: deal.coupon_id,
      merchant_id: "agentic-merchant",
      merchant_name: deal.merchant_name,
      code: "AGENTIC_SMART_DEAL",
      title: deal.coupon_title,
      description: deal.rationale,
      category: "food",
      discount_type: "percentage",
      discount_value: deal.savings_percentage,
      min_order_amount: 100,
      expiry_date: new Date(Date.now() + 86400000 * 30).toISOString(),
      usage_limit: 500,
      times_used: 10,
      is_active: true,
    };
    onSelectCouponForCheckout(mockCoupon);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-orange-400/10 flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
              <span>Agentic Commerce Copilot</span>
              <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0.2 rounded-full uppercase font-black">
                Autonomous
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Autonomous deal discovery with user approval</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                m.sender === "user"
                  ? "bg-[#0079C1] text-white rounded-br-xs"
                  : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/80"
              }`}
            >
              <p className="leading-relaxed font-medium">{m.text}</p>

              {/* Suggested Deal Proposals Card */}
              {m.deals && m.deals.length > 0 && (
                <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-200">
                  <p className="font-bold text-[11px] text-slate-700 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Top Ranked Deal Proposal:</span>
                  </p>
                  {m.deals.slice(0, 2).map((deal, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 text-slate-900"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-[#0079C1] uppercase">
                            {deal.merchant_name}
                          </span>
                          <h5 className="font-bold text-xs">{deal.coupon_title}</h5>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                          {deal.savings_percentage}% OFF
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline text-xs bg-slate-50 p-2 rounded">
                        <span className="text-slate-500 line-through">₹{deal.original_price}</span>
                        <span className="font-extrabold text-[#003087] text-sm">
                          ₹{deal.final_price}
                        </span>
                        <span className="text-emerald-600 font-bold text-[11px]">
                          Save ₹{deal.discount_amount}
                        </span>
                      </div>

                      {/* Explicit User Approval Button */}
                      <button
                        onClick={() => handleApproveDeal(deal)}
                        className="w-full bg-[#ffc439] hover:bg-[#f4bb34] text-slate-900 font-black py-2 px-3 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 border border-amber-400 shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-slate-900" />
                        <span>Approve & Checkout with PayPal</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span>AI Copilot is analyzing coupons and calculating discounts...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-1.5">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="text-[10px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-2.5 py-1 rounded-full transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputMessage);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="E.g., I want to order food for ₹500..."
            className="flex-1 py-2 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 bg-[#0079C1] hover:bg-[#005ea6] disabled:opacity-50 text-white rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
