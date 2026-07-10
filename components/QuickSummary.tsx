"use client";

import { useEffect, useState } from "react";
import { entriesAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";
import { Person } from "@/lib/types";

interface QuickSummaryProps {
  currentUser: Person;
}

export default function QuickSummary({ currentUser }: QuickSummaryProps) {
  const [todaySummary, setTodaySummary] = useState({ expense: 0, income: 0, count: 0 });
  const [yesterdaySummary, setYesterdaySummary] = useState({ expense: 0, income: 0, count: 0 });
  const [weekSummary, setWeekSummary] = useState({ expense: 0, income: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummaries();
  }, [currentUser]);

  async function loadSummaries() {
    setLoading(true);
    try {
      const [today, yesterday, week] = await Promise.all([
        entriesAPI.getSummary("today", currentUser),
        entriesAPI.getSummary("yesterday", currentUser),
        entriesAPI.getSummary("week", currentUser),
      ]);

      setTodaySummary(today);
      setYesterdaySummary(yesterday);
      setWeekSummary(week);
    } catch (error) {
      console.error("Failed to load summaries:", error);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="gaming-card h-20 sm:h-24"></div>
        ))}
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Today",
      icon: "📅",
      expense: todaySummary.expense,
      count: todaySummary.count,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Yesterday",
      icon: "⏮️",
      expense: yesterdaySummary.expense,
      count: yesterdaySummary.count,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "This Week",
      icon: "📆",
      expense: weekSummary.expense,
      count: weekSummary.count,
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
      {summaryCards.map((card) => (
        <div key={card.title} className="gaming-card px-3 sm:px-4 py-3 sm:py-4 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl sm:text-2xl">{card.icon}</span>
            <div className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r ${card.color} text-white`}>
              {card.count}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mb-1">{card.title}</p>
          <p className="text-sm sm:text-lg font-bold text-white tabular-figures">
            {formatCurrency(card.expense)}
          </p>
        </div>
      ))}
    </div>
  );
}
