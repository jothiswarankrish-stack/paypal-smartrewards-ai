"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SpendingCategoryBreakdown } from "../types";

interface SpendingChartsProps {
  categoryBreakdown: SpendingCategoryBreakdown[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
  food: "#f97316",
  taxi: "#0070E0",
  shopping: "#9333ea",
  groceries: "#16a34a",
  entertainment: "#e11d48",
  travel: "#0d9488",
};

export default function SpendingCharts({ categoryBreakdown }: SpendingChartsProps) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
        No transaction records available.
      </div>
    );
  }

  const pieData = categoryBreakdown.map((item) => ({
    name: item.category.toUpperCase(),
    value: item.total_amount,
    percentage: item.percentage,
    color: CATEGORY_COLORS[item.category.toLowerCase()] || "#64748b",
  }));

  return (
    <div className="space-y-3">
      {/* Donut Chart (Compact Mobile Sized) */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={4}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: any) => [`₹${Number(val || 0).toLocaleString()}`, "Spend"]}
              contentStyle={{
                borderRadius: "12px",
                fontSize: "11px",
                border: "1px solid #E5E9EE",
                padding: "6px 10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Horizontal Progress Bars Breakdown */}
      <div className="space-y-2 pt-1">
        {categoryBreakdown.slice(0, 4).map((item) => {
          const color = CATEGORY_COLORS[item.category.toLowerCase()] || "#0070E0";
          return (
            <div key={item.category} className="text-xs">
              <div className="flex justify-between items-center mb-1 text-[11px]">
                <span className="font-bold text-[#001435] capitalize">
                  {item.category}
                </span>
                <span className="text-[#536477] font-semibold">
                  ₹{item.total_amount.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-[#F0F2F5] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(8, item.percentage))}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
