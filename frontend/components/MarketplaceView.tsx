"use client";

import React, { useState } from "react";
import { Coupon } from "../types";
import {
  Tag,
  Search,
  ArrowRight,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Apple,
  Film,
  Plane,
  Clock,
  Sparkles,
} from "lucide-react";

interface MarketplaceViewProps {
  coupons: Coupon[];
  onSelectCouponForCheckout: (coupon: Coupon) => void;
  onFilterChange: (category: string, search: string) => void;
}

const CATEGORIES = [
  { id: "all", name: "All Rewards", icon: Tag },
  { id: "food", name: "Food Delivery", icon: UtensilsCrossed },
  { id: "taxi", name: "Taxi & Rides", icon: Car },
  { id: "shopping", name: "Online Shopping", icon: ShoppingBag },
  { id: "groceries", name: "Groceries", icon: Apple },
  { id: "entertainment", name: "Entertainment", icon: Film },
  { id: "travel", name: "Travel & Hotels", icon: Plane },
];

export default function MarketplaceView({
  coupons,
  onSelectCouponForCheckout,
  onFilterChange,
}: MarketplaceViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    onFilterChange(catId, searchText);
  };

  const handleSearchChange = (val: string) => {
    setSearchText(val);
    onFilterChange(selectedCategory, val);
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filters */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Merchant Reward Marketplace</h2>
            <p className="text-xs text-slate-500">
              Browse eligible partner offers redeemable directly via PayPal Checkout
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search coupons or brands..."
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0079C1]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? "bg-[#0079C1] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
          >
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {coupon.merchant_name}
                  </span>
                  <span className="text-xs font-semibold text-[#0079C1] capitalize">
                    {coupon.category}
                  </span>
                </div>
                <div className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
                  {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                  {coupon.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {coupon.description}
                </p>
              </div>

              {/* Promo Code Badge */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 font-mono">
                <span className="text-slate-400 text-[10px]">CODE:</span>
                <span className="font-bold text-slate-800 tracking-wide">{coupon.code}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-500">
                <div>
                  <span className="block text-slate-400">Min Purchase:</span>
                  <span className="font-bold text-slate-800">₹{coupon.min_order_amount}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Expires:</span>
                  <span className="font-medium text-slate-700">
                    {new Date(coupon.expiry_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => onSelectCouponForCheckout(coupon)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <span>Select & Checkout with PayPal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
