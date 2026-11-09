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
      <div className="p-6 bg-white rounded-2xl border border-[#DDE3EA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#001435]">Reward Marketplace</h2>
            <p className="text-xs text-[#536477]">
              Browse merchant offers redeemable with your PayPal account
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#536477] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by merchant or category..."
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-xs border border-[#DDE3EA] rounded-full focus:outline-none focus:ring-2 focus:ring-[#0070E0] bg-[#F5F7FA]"
            />
          </div>
        </div>

        {/* Category Filter Pills (PayPal Style) */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? "bg-[#003087] text-white shadow-xs"
                    : "bg-[#F5F7FA] text-[#536477] hover:bg-[#EBF3FB] hover:text-[#001435] border border-[#DDE3EA]"
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
            className="rounded-2xl bg-white border border-[#DDE3EA] shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
          >
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-extrabold text-[#536477] uppercase tracking-wider block">
                    {coupon.merchant_name}
                  </span>
                  <span className="text-xs font-bold text-[#0070E0] capitalize">
                    {coupon.category}
                  </span>
                </div>
                <div className="bg-[#EBF3FB] text-[#003087] text-xs font-black px-3 py-1 rounded-full border border-[#BDE0FE]">
                  {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-[#001435] text-sm leading-snug">
                  {coupon.title}
                </h4>
                <p className="text-xs text-[#536477] mt-1 line-clamp-2 leading-relaxed">
                  {coupon.description}
                </p>
              </div>

              {/* Promo Code Badge */}
              <div className="flex items-center justify-between text-xs bg-[#F5F7FA] p-2.5 rounded-xl border border-[#DDE3EA] font-mono">
                <span className="text-[#536477] text-[10px] font-bold">CODE:</span>
                <span className="font-bold text-[#001435] tracking-wide">{coupon.code}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-[#536477]">
                <div>
                  <span className="block text-[#536477]">Min Purchase:</span>
                  <span className="font-bold text-[#001435]">₹{coupon.min_order_amount}</span>
                </div>
                <div>
                  <span className="block text-[#536477]">Expires:</span>
                  <span className="font-medium text-[#001435]">
                    {new Date(coupon.expiry_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F5F7FA] border-t border-[#DDE3EA]">
              <button
                onClick={() => onSelectCouponForCheckout(coupon)}
                className="w-full bg-[#0070E0] hover:bg-[#003087] text-white font-extrabold py-2.5 px-4 rounded-full text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <span>Redeem with PayPal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
