import { Entry, Holding } from "./types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function cashBalance(entries: Entry[]): number {
  return entries.reduce(
    (sum, e) => sum + (e.type === "income" ? e.amount : -e.amount),
    0
  );
}

export function investedTotal(holdings: Holding[]): number {
  return holdings.reduce((sum, h) => sum + h.invested, 0);
}

export function currentValueTotal(holdings: Holding[]): number {
  return holdings.reduce((sum, h) => sum + h.current_value, 0);
}

export function netWorth(entries: Entry[], holdings: Holding[]): number {
  return cashBalance(entries) + currentValueTotal(holdings);
}

export function savingsRate(entries: Entry[]): number {
  const income = entries
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + e.amount, 0);
  const expense = entries
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);
  if (income === 0) return 0;
  return ((income - expense) / income) * 100;
}

export function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthlyTrend(entries: Entry[]) {
  const map = new Map<string, { income: number; expense: number }>();
  for (const e of entries) {
    const key = monthKey(e.date);
    if (!map.has(key)) map.set(key, { income: 0, expense: 0 });
    const bucket = map.get(key)!;
    if (e.type === "income") bucket.income += e.amount;
    else bucket.expense += e.amount;
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, v]) => ({ month, ...v, net: v.income - v.expense }));
}

export function categoryBreakdown(entries: Entry[]) {
  const map = new Map<string, number>();
  for (const e of entries) {
    if (e.type !== "expense") continue;
    map.set(e.category, (map.get(e.category) || 0) + e.amount);
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

// Average of the last N months' net savings, used to extrapolate a forecast.
export function averageMonthlyNet(entries: Entry[], months = 3): number {
  const trend = monthlyTrend(entries);
  const recent = trend.slice(-months);
  if (recent.length === 0) return 0;
  return recent.reduce((s, m) => s + m.net, 0) / recent.length;
}

export function forecastCashBalance(
  entries: Entry[],
  monthsAhead: number
): number {
  const current = cashBalance(entries);
  const avgNet = averageMonthlyNet(entries);
  return current + avgNet * monthsAhead;
}

// Simple compound growth projection based on each holding's implied
// historical return (current_value / invested), applied forward.
export function forecastInvestmentValue(
  holdings: Holding[],
  monthsAhead: number
): number {
  return holdings.reduce((sum, h) => {
    if (h.invested <= 0) return sum + h.current_value;
    const totalReturnRatio = h.current_value / h.invested;
    // Assume the observed return happened over 12 months as a rough baseline.
    const monthlyRate = Math.pow(totalReturnRatio, 1 / 12) - 1;
    const projected = h.current_value * Math.pow(1 + monthlyRate, monthsAhead);
    return sum + (isFinite(projected) ? projected : h.current_value);
  }, 0);
}
