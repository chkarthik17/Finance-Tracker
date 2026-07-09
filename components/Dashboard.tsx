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

const STAT_COLORS = {
  ledger: "#0F3D2E",
  rust: "#B5502A",
  gold: "#C79A3C",
};

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="ledger-card px-5 py-4">
      <p className="text-xs uppercase tracking-wider text-ink/50 font-body">
        {label}
      </p>
      <p
        className="font-mono text-xl sm:text-2xl mt-1 tabular-figures"
        style={{ color: accent || "#1B1B18" }}
      >
        {value}
      </p>
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
  const recent = [...entries]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  if (entries.length === 0 && holdings.length === 0) {
    return (
      <div className="ledger-card px-6 py-12 text-center">
        <p className="font-display text-xl text-ledger">
          The ledger is empty.
        </p>
        <p className="text-ink/60 mt-2 text-sm">
          Add your first entry from the Entries tab to see the numbers here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Net worth" value={formatCurrency(nw)} accent={STAT_COLORS.ledger} />
        <Stat label="Cash balance" value={formatCurrency(cash)} />
        <Stat
          label="Invested"
          value={formatCurrency(currentVal)}
          accent={STAT_COLORS.gold}
        />
        <Stat
          label="Savings rate"
          value={`${rate.toFixed(0)}%`}
          accent={rate >= 0 ? STAT_COLORS.ledger : STAT_COLORS.rust}
        />
      </div>

      {trend.length > 0 && (
        <div className="ledger-card px-5 py-5">
          <p className="font-display text-lg text-ledger mb-4">
            Income vs. expenses, by month
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend}>
              <CartesianGrid stroke="#DDD6C8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#1B1B1880" />
              <YAxis tick={{ fontSize: 11 }} stroke="#1B1B1880" width={70} />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{ fontSize: 12, borderRadius: 4 }}
              />
              <Line type="monotone" dataKey="income" stroke="#0F3D2E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expense" stroke="#B5502A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {categories.length > 0 && (
          <div className="ledger-card px-5 py-5">
            <p className="font-display text-lg text-ledger mb-4">
              Spending by category
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categories} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="#DDD6C8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#1B1B1880" />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={80}
                  tick={{ fontSize: 11 }}
                  stroke="#1B1B1880"
                />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="amount" fill="#C79A3C" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="ledger-card px-5 py-5">
          <p className="font-display text-lg text-ledger mb-4">Recent entries</p>
          <div className="space-y-0">
            {recent.length === 0 && (
              <p className="text-sm text-ink/50">No entries yet.</p>
            )}
            {recent.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-2 ledger-rule text-sm"
              >
                <div>
                  <p className="text-ink">{e.category}</p>
                  <p className="text-ink/40 text-xs font-mono">
                    {e.date} · {e.person}
                  </p>
                </div>
                <p
                  className="font-mono tabular-figures"
                  style={{ color: e.type === "income" ? STAT_COLORS.ledger : STAT_COLORS.rust }}
                >
                  {e.type === "income" ? "+" : "-"}
                  {formatCurrency(e.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
