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
  { id: "all", name: "All", icon: Tag },
  { id: "food", name: "Food", icon: UtensilsCrossed },
  { id: "taxi", name: "Rides", icon: Car },
  { id: "shopping", name: "Shop", icon: ShoppingBag },
  { id: "groceries", name: "Grocery", icon: Apple },
  { id: "entertainment", name: "Movies", icon: Film },
  { id: "travel", name: "Travel", icon: Plane },
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
    <div className="space-y-3.5">
      {/* Search Input Bar (PayPal Rounded Full) */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search partner deals..."
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E5E9EE] rounded-full focus:outline-none focus:ring-2 focus:ring-[#0070E0] bg-white text-[#001435] shadow-2xs"
        />
      </div>

      {/* Horizontal Category Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto hide-scrollbar py-0.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-[#003087] text-white shadow-xs"
                  : "bg-white text-[#536477] hover:bg-[#F5F7FA] border border-[#E5E9EE]"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Deals Stack (Mobile Single Column) */}
      <div className="space-y-3">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="rounded-3xl bg-white border border-[#E5E9EE] p-4 shadow-2xs hover:shadow-sm transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-2">
                <span className="text-[10px] font-extrabold text-[#8B95A5] uppercase tracking-wider block">
                  {coupon.merchant_name}
                </span>
                <h4 className="font-extrabold text-xs text-[#001435] mt-0.5 leading-snug">
                  {coupon.title}
                </h4>
                <p className="text-[11px] text-[#536477] mt-1 line-clamp-2 leading-relaxed">
                  {coupon.description}
                </p>
              </div>

              {/* Discount Badge */}
              <div className="bg-[#EBF9F1] text-[#00875A] text-xs font-black px-2.5 py-1 rounded-full border border-[#D5F5E3] shrink-0">
                {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
              </div>
            </div>

            {/* Bottom bar with min spend & claim button */}
            <div className="mt-3 pt-2.5 border-t border-[#F0F2F5] flex items-center justify-between">
              <span className="text-[10px] text-[#8B95A5]">
                Min order: ₹{coupon.min_order_amount}
              </span>

              <button
                onClick={() => onSelectCouponForCheckout(coupon)}
                className="bg-[#0070E0] hover:bg-[#003087] text-white font-extrabold py-1.5 px-4 rounded-full text-xs transition-all flex items-center space-x-1 shadow-xs cursor-pointer"
              >
                <span>Redeem</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
