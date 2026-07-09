"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Entry, Holding } from "@/lib/types";
import {
  cashBalance,
  averageMonthlyNet,
  forecastCashBalance,
  forecastInvestmentValue,
  currentValueTotal,
  formatCurrency,
} from "@/lib/calculations";

export default function Forecast({
  entries,
  holdings,
}: {
  entries: Entry[];
  holdings: Holding[];
}) {
  const avgNet = averageMonthlyNet(entries);
  const horizons = [3, 6, 12];
  const currentCash = cashBalance(entries);
  const currentInvested = currentValueTotal(holdings);

  const chartData = Array.from({ length: 13 }, (_, i) => ({
    month: i === 0 ? "Now" : `+${i}mo`,
    cash: forecastCashBalance(entries, i),
    invested: forecastInvestmentValue(holdings, i),
  }));

  if (entries.length < 2) {
    return (
      <div className="ledger-card px-6 py-12 text-center">
        <p className="font-display text-xl text-ledger">Not enough data yet.</p>
        <p className="text-ink/60 mt-2 text-sm">
          Add a few weeks of entries and the forecast will start to take shape.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="ledger-card px-5 py-5">
        <p className="font-display text-lg text-ledger mb-1">
          Projected cash + investments
        </p>
        <p className="text-xs text-ink/50 mb-4">
          Based on your average net savings over the last 3 months of data.
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#DDD6C8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#1B1B1880" />
            <YAxis tick={{ fontSize: 11 }} stroke="#1B1B1880" width={70} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="cash" stroke="#0F3D2E" strokeWidth={2} dot={false} name="Cash" />
            <Line type="monotone" dataKey="invested" stroke="#C79A3C" strokeWidth={2} dot={false} name="Invested" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {horizons.map((m) => {
          const cash = forecastCashBalance(entries, m);
          const invested = forecastInvestmentValue(holdings, m);
          return (
            <div key={m} className="ledger-card px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-ink/50">
                In {m} months
              </p>
              <p className="font-mono text-xl mt-1 tabular-figures text-ledger">
                {formatCurrency(cash + invested)}
              </p>
              <p className="text-xs text-ink/40 mt-1 font-mono">
                cash {formatCurrency(cash)} · invested {formatCurrency(invested)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="ledger-card px-5 py-4">
        <p className="text-sm text-ink/70">
          Your average monthly net savings recently is{" "}
          <span
            className="font-mono"
            style={{ color: avgNet >= 0 ? "#0F3D2E" : "#B5502A" }}
          >
            {formatCurrency(avgNet)}
          </span>
          . Investment growth is projected from each holding's own implied
          return, assuming it continues at the same pace.
        </p>
        <p className="text-xs text-ink/40 mt-3">
          This is a simple trend extrapolation, not financial advice — treat it
          as a rough guide, especially with only a few months of data.
        </p>
      </div>
    </div>
  );
}
