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
      text: "Hi! I'm your PayPal Shopping Assistant. Tell me what you're looking for (e.g., 'Find food for ₹500' or 'Uber cab discount'), and I'll find the best deals for you!",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "Food under ₹500",
    "Taxi deals",
    "Shopping offers",
    "Grocery discounts",
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
          text: "I couldn't find deals right now. Please try again!",
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
    <div className="fixed inset-0 z-50 bg-[#001435]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#DDE3EA] h-[85vh] sm:h-[650px] flex flex-col animate-in slide-in-from-bottom-8 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E9EE] bg-[#003087] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4 text-[#FFC439]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center space-x-1.5">
                <span>AI Shopping Assistant</span>
              </h3>
              <p className="text-[10px] text-blue-200">Personalized deal finder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F7FA]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#0070E0] text-white rounded-br-xs font-semibold"
                    : "bg-white text-[#001435] rounded-bl-xs border border-[#E5E9EE] shadow-2xs"
                }`}
              >
                <p>{m.text}</p>

                {/* Deal Comparison Cards */}
                {m.deals && m.deals.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-[#F0F2F5]">
                    {m.deals.slice(0, 2).map((deal, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E5E9EE] space-y-2 text-[#001435]"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-extrabold text-[#0070E0] uppercase tracking-wider">
                              {deal.merchant_name}
                            </span>
                            <h5 className="font-extrabold text-xs">{deal.coupon_title}</h5>
                          </div>
                          <span className="bg-[#EBF9F1] text-[#00875A] text-[10px] font-black px-2 py-0.5 rounded-full">
                            {deal.savings_percentage}% OFF
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline text-xs bg-white p-2 rounded-xl border border-[#E5E9EE]">
                          <span className="text-[#8B95A5] line-through text-[11px]">₹{deal.original_price}</span>
                          <span className="font-black text-[#003087]">
                            ₹{deal.final_price}
                          </span>
                          <span className="text-[#00875A] font-bold text-[10px]">
                            Save ₹{deal.discount_amount}
                          </span>
                        </div>

                        <button
                          onClick={() => handleApproveDeal(deal)}
                          className="w-full bg-[#FFC439] hover:bg-[#F2B82E] text-[#001435] font-black py-2 px-3 rounded-full text-xs transition-all flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Buy with PayPal</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-[#536477] p-2.5 bg-white rounded-2xl border border-[#E5E9EE] w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0070E0]" />
              <span className="text-[11px]">Finding top discounts...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-3 py-2 border-t border-[#E5E9EE] bg-white flex items-center space-x-1.5 overflow-x-auto hide-scrollbar shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="text-[10px] bg-[#F5F7FA] border border-[#E5E9EE] text-[#536477] hover:text-[#001435] hover:bg-[#EBF3FB] px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-semibold shrink-0 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-3 border-t border-[#E5E9EE] bg-white shrink-0">
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
              placeholder="Ask for deals (e.g. food, rides)..."
              className="flex-1 py-2 px-3.5 text-xs border border-[#E5E9EE] rounded-full focus:outline-none focus:ring-2 focus:ring-[#0070E0] text-[#001435] bg-[#F5F7FA]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 bg-[#0070E0] hover:bg-[#003087] disabled:opacity-40 text-white rounded-full transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
