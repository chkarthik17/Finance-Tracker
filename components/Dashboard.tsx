"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Entry, Holding } from "@/lib/types";
import {
  cashBalance,
  investedTotal,
  currentValueTotal,
  netWorth,
  savingsRate,
  monthlyTrend,
  categoryBreakdown,
  formatCurrency,
} from "@/lib/calculations";

function GamingStat({
  icon,
  label,
  value,
  subValue,
  gradient,
}: {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  gradient: string;
}) {
  return (
    <div className="gaming-card px-4 sm:px-6 py-4 sm:py-5 hover:scale-[1.02] sm:hover:scale-105 transition-transform duration-300">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <span className="text-2xl sm:text-3xl md:text-4xl">{icon}</span>
        <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${gradient}`}>
          {label}
        </div>
      </div>
      <p className="font-mono text-xl sm:text-2xl md:text-3xl font-bold text-white tabular-figures">
        {value}
      </p>
      {subValue && (
        <p className="text-gray-400 text-xs sm:text-sm mt-1 font-mono">{subValue}</p>
      )}
    </div>
  );
}

function BudgetCard({
  monthlyIncome,
  monthlyExpense,
  balance,
  daysLeft,
  dailyBudget,
}: {
  monthlyIncome: number;
  monthlyExpense: number;
  balance: number;
  daysLeft: number;
  dailyBudget: number;
}) {
  const spentPercentage = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;
  const isOverBudget = balance < 0;

  return (
    <div className="gaming-card px-4 sm:px-6 py-5 sm:py-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 animate-pulse-glow"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold gradient-text flex items-center gap-2">
            <span>📅</span>
            <span className="hidden sm:inline">Monthly Budget Plan</span>
            <span className="sm:hidden">Budget</span>
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400 hidden sm:inline">TRACKING</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Spent this month</span>
            <span className="text-sm font-mono font-bold text-white">
              {spentPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-3 bg-dark-card rounded-full overflow-hidden border border-dark-border">
            <div
              className={`h-full transition-all duration-500 ${
                spentPercentage > 90 ? 'bg-gradient-to-r from-red-500 to-neon-pink' :
                spentPercentage > 70 ? 'bg-gradient-to-r from-neon-orange to-yellow-500' :
                'bg-gradient-to-r from-neon-green to-green-500'
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Days Left</p>
            <p className="text-2xl font-gaming font-bold text-neon-blue">{daysLeft}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Balance</p>
            <p className={`text-2xl font-gaming font-bold ${isOverBudget ? 'text-neon-pink' : 'text-neon-green'}`}>
              {formatCurrency(Math.abs(balance))}
            </p>
          </div>
        </div>

        {/* Daily Budget Recommendation */}
        <div className={`border-2 rounded-lg p-3 sm:p-4 ${
          isOverBudget
            ? 'border-red-500/50 bg-red-500/10'
            : 'border-green-500/50 bg-green-500/10'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">{isOverBudget ? '⚠️' : '💡'}</span>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-300 font-medium mb-0.5 sm:mb-1">
                {isOverBudget ? 'Over Budget Alert!' : 'Daily Budget'}
              </p>
              <p className="text-base sm:text-lg md:text-xl font-semibold text-white">
                {isOverBudget ? 'Reduce spending!' : `₹${dailyBudget.toFixed(0)}/day`}
              </p>
              {!isOverBudget && (
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                  Stay within this to maintain balance
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({
  entries,
  holdings,
}: {
  entries: Entry[];
  holdings: Holding[];
}) {
  const cash = cashBalance(entries);
  const invested = investedTotal(holdings);
  const currentVal = currentValueTotal(holdings);
  const nw = netWorth(entries, holdings);
  const rate = savingsRate(entries);
  const trend = monthlyTrend(entries);
  const categories = categoryBreakdown(entries).slice(0, 6);

  // Calculate monthly stats
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const monthlyEntries = entries.filter(e => e.date.startsWith(currentMonth));

  const monthlyIncome = monthlyEntries
    .filter(e => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlyExpense = monthlyEntries
    .filter(e => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = monthlyIncome - monthlyExpense;

  // Calculate days left in month
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.max(1, lastDayOfMonth.getDate() - now.getDate());

  // Daily budget recommendation
  const dailyBudget = balance > 0 ? balance / daysLeft : 0;

  // Total income and expenses (all time)
  const totalIncome = entries
    .filter(e => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = entries
    .filter(e => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  if (entries.length === 0 && holdings.length === 0) {
    return (
      <div className="gaming-card px-8 py-16 text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="font-gaming text-2xl font-bold gradient-text mb-2">
          Dashboard Empty
        </p>
        <p className="text-gray-400 text-sm">
          Add your first entry from the Entries tab to see analytics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <GamingStat
          icon="💰"
          label="TOTAL INCOME"
          value={formatCurrency(totalIncome)}
          subValue={`${monthlyEntries.filter(e => e.type === "income").length} transactions`}
          gradient="bg-gradient-to-r from-green-400 to-emerald-500 text-white"
        />
        <GamingStat
          icon="💸"
          label="EXPENSE"
          value={formatCurrency(totalExpense)}
          subValue={`${monthlyEntries.filter(e => e.type === "expense").length} transactions`}
          gradient="bg-gradient-to-r from-pink-500 to-rose-500 text-white"
        />
        <GamingStat
          icon="💼"
          label="NET WORTH"
          value={formatCurrency(nw)}
          subValue={`Invested: ${formatCurrency(currentVal)}`}
          gradient="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
        />
        <GamingStat
          icon="📈"
          label="SAVINGS"
          value={`${rate.toFixed(0)}%`}
          subValue={rate >= 20 ? "Great!" : "Improve"}
          gradient={rate >= 20
            ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white"
            : "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
          }
        />
      </div>

      {/* Budget Management Card */}
      <BudgetCard
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
        balance={balance}
        daysLeft={daysLeft}
        dailyBudget={dailyBudget}
      />

      {/* Charts */}
      {trend.length > 0 && (
        <div className="gaming-card px-4 sm:px-6 py-5 sm:py-6">
          <p className="text-base sm:text-lg font-semibold gradient-text mb-4 sm:mb-6">
            📊 Income vs Expenses Trend
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid stroke="rgba(30, 36, 51, 0.5)" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="#1e2433"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="#1e2433"
                width={80}
              />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  backgroundColor: '#141824',
                  border: '1px solid #1e2433',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#00ff88"
                strokeWidth={3}
                dot={{ fill: '#00ff88', r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ff0080"
                strokeWidth={3}
                dot={{ fill: '#ff0080', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {categories.length > 0 && (
          <div className="gaming-card px-4 sm:px-6 py-5 sm:py-6">
            <p className="text-base sm:text-lg font-semibold gradient-text mb-4 sm:mb-6">
              🏷️ Spending by Category
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categories} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="rgba(30, 36, 51, 0.5)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  stroke="#1e2433"
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={100}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  stroke="#1e2433"
                />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    backgroundColor: '#141824',
                    border: '1px solid #1e2433',
                    color: '#fff'
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#colorGradient)"
                  radius={[0, 8, 8, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#b845ff" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="gaming-card px-4 sm:px-6 py-5 sm:py-6">
          <p className="text-base sm:text-lg font-semibold gradient-text mb-4 sm:mb-6">
            ⚡ Recent Activity
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {monthlyEntries.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm text-gray-400">No transactions this month</p>
              </div>
            ) : (
              monthlyEntries.slice(0, 6).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-card border border-dark-border hover:border-neon-blue/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{e.type === "income" ? "💰" : "💸"}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{e.category}</p>
                      <p className="text-gray-400 text-xs font-mono">{e.date}</p>
                    </div>
                  </div>
                  <p
                    className={`font-mono text-lg font-bold tabular-figures ${
                      e.type === "income" ? "text-neon-green" : "text-neon-pink"
                    }`}
                  >
                    {e.type === "income" ? "+" : "-"}
                    {formatCurrency(e.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
