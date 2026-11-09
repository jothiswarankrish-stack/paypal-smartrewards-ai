"use client";

import React, { useState } from "react";
import { User, DealProposal, Coupon } from "../types";
import { sendAgentMessage } from "../lib/api";
import {
  Bot,
  X,
  Send,
  Sparkles,
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
      text: "Hello! I am your PayPal SmartRewards AI Shopping Copilot. Tell me what you'd like to purchase or your target budget (e.g., 'I want food for ₹500' or 'Find taxi discounts'), and I will scan active partner rewards, compute your exact savings, and prepare a PayPal Sandbox checkout for your approval!",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "I want food for ₹500",
    "Find taxi discounts under ₹400",
    "Shopping deals for ₹2000",
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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "I experienced an error analyzing active deals. Please try rephrasing your request!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDeal = (deal: DealProposal) => {
    const mockCoupon: Coupon = {
      id: deal.coupon_id,
      merchant_id: "agentic-merchant",
      merchant_name: deal.merchant_name,
      code: "SMART_COPILOT_DEAL",
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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-[#DDE3EA] flex flex-col animate-in slide-in-from-right duration-300">
      {/* PayPal Branded Drawer Header */}
      <div className="p-4 border-b border-[#DDE3EA] bg-[#F0F7FD] flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0070E0] text-white flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#001435] text-sm flex items-center space-x-1.5">
              <span>AI Shopping Copilot</span>
              <span className="bg-[#003087] text-white text-[9px] px-2 py-0.5 rounded-full uppercase font-black">
                Agentic
              </span>
            </h3>
            <p className="text-[11px] text-[#536477]">Autonomous deal discovery with explicit approval</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-[#536477] hover:text-[#001435] hover:bg-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Surface (Clean White & Light Blue) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs ${
                m.sender === "user"
                  ? "bg-[#0070E0] text-white rounded-br-xs shadow-xs font-semibold"
                  : "bg-[#F0F7FD] text-[#001435] rounded-bl-xs border border-[#BDE0FE]"
              }`}
            >
              <p className="leading-relaxed font-medium">{m.text}</p>

              {/* Deal Comparison Cards */}
              {m.deals && m.deals.length > 0 && (
                <div className="mt-3.5 space-y-2.5 pt-2.5 border-t border-[#BDE0FE]">
                  <p className="font-extrabold text-[11px] text-[#003087] flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-[#0070E0]" />
                    <span>Ranked Deal Proposal:</span>
                  </p>
                  {m.deals.slice(0, 2).map((deal, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-3 bg-white rounded-xl border border-[#DDE3EA] shadow-xs space-y-2 text-[#001435]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#0070E0] uppercase tracking-wider">
                            {deal.merchant_name}
                          </span>
                          <h5 className="font-bold text-xs">{deal.coupon_title}</h5>
                        </div>
                        <span className="bg-[#E3FCEF] text-[#00875A] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#ABF5D1]">
                          {deal.savings_percentage}% OFF
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline text-xs bg-[#F5F7FA] p-2 rounded-lg">
                        <span className="text-[#536477] line-through">₹{deal.original_price}</span>
                        <span className="font-black text-[#003087] text-sm">
                          ₹{deal.final_price}
                        </span>
                        <span className="text-[#00875A] font-bold text-[11px]">
                          Save ₹{deal.discount_amount}
                        </span>
                      </div>

                      {/* Explicit User Approval Button (PayPal Gold) */}
                      <button
                        onClick={() => handleApproveDeal(deal)}
                        className="w-full bg-[#FFC439] hover:bg-[#F2B82E] text-[#001435] font-black py-2.5 px-3 rounded-full text-xs transition flex items-center justify-center space-x-1.5 border border-[#E5AD24] shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-[#001435]" />
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
          <div className="flex items-center space-x-2 text-xs text-[#536477] p-2 bg-[#F0F7FD] rounded-xl border border-[#BDE0FE]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0070E0]" />
            <span>AI Copilot is analyzing coupons and calculating discounts...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 border-t border-[#DDE3EA] bg-[#F5F7FA] flex flex-wrap gap-1.5">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="text-[10px] bg-white border border-[#DDE3EA] text-[#536477] hover:text-[#001435] hover:bg-[#EBF3FB] px-3 py-1 rounded-full transition font-semibold"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-3.5 border-t border-[#DDE3EA] bg-white">
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
            className="flex-1 py-2.5 px-4 text-xs border border-[#DDE3EA] rounded-full focus:outline-none focus:ring-2 focus:ring-[#0070E0] text-[#001435] bg-[#F5F7FA]"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 bg-[#0070E0] hover:bg-[#003087] disabled:opacity-50 text-white rounded-full transition shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
