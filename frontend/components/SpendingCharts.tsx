"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { SpendingCategoryBreakdown } from "../types";

interface SpendingChartsProps {
  categoryBreakdown: SpendingCategoryBreakdown[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
  food: "#f97316", // Orange
  taxi: "#2563eb", // Blue
  shopping: "#9333ea", // Purple
  groceries: "#16a34a", // Green
  entertainment: "#e11d48", // Rose
  travel: "#0d9488", // Teal
};

export default function SpendingCharts({ categoryBreakdown }: SpendingChartsProps) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
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

  const barData = categoryBreakdown.map((item) => ({
    category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    amount: item.total_amount,
    transactions: item.transaction_count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Spend Distribution (Donut Chart) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="mb-4">
          <h4 className="text-sm font-extrabold text-slate-900">Category Spending Distribution</h4>
          <p className="text-xs text-slate-500">30-day percentage share of total expenditure</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`₹${Number(val || 0).toLocaleString()}`, "Spend"]}
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              />
              <Legend
                formatter={(val) => <span className="text-xs text-slate-700 font-medium">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Spending vs Order Counts (Bar Chart) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="mb-4">
          <h4 className="text-sm font-extrabold text-slate-900">Total Spent by Category (INR)</h4>
          <p className="text-xs text-slate-500">Direct inputs fueling the AI recommendation scoring</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val || 0).toLocaleString()}`, "Amount"]}
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="amount" fill="#0079C1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
