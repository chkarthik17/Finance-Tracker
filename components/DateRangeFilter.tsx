"use client";

import { useState } from "react";

export type DateRange = "today" | "yesterday" | "week" | "month" | "all";

interface DateRangeFilterProps {
  selected: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangeFilter({ selected, onChange }: DateRangeFilterProps) {
  const ranges: { value: DateRange; label: string; icon: string }[] = [
    { value: "today", label: "Today", icon: "📅" },
    { value: "yesterday", label: "Yesterday", icon: "⏮️" },
    { value: "week", label: "This Week", icon: "📆" },
    { value: "month", label: "This Month", icon: "🗓️" },
    { value: "all", label: "All Time", icon: "🕐" },
  ];

  return (
    <div className="gaming-card px-4 sm:px-5 py-3 sm:py-4 mb-4 sm:mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-sm text-gray-400 font-medium">View:</span>
        <div className="flex gap-2 flex-wrap">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => onChange(range.value)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
                selected === range.value
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{range.icon}</span>
              <span className="hidden sm:inline">{range.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function getDateRangeParams(range: DateRange): { startDate?: string; endDate?: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  if (range === "today") {
    return { startDate: today, endDate: today };
  }

  if (range === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    return { startDate: yesterdayStr, endDate: yesterdayStr };
  }

  if (range === "week") {
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return {
      startDate: startOfWeek.toISOString().slice(0, 10),
      endDate: today,
    };
  }

  if (range === "month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDate: startOfMonth.toISOString().slice(0, 10),
      endDate: today,
    };
  }

  return {}; // all time - no filters
}
