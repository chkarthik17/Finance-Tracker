"use client";

import clsx from "clsx";

const TABS = ["Ledger", "Entries", "Holdings", "Forecast", "Plans"] as const;
export type Tab = (typeof TABS)[number];

export default function Nav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <header className="ledger-rule bg-paper/95 sticky top-0 z-10 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-baseline justify-between py-5">
          <div>
            <p className="font-display italic text-sm text-rust tracking-wide">
              No. 01 — Household Accounts
            </p>
            <h1 className="font-display text-2xl sm:text-3xl text-ledger">
              The Ledger
            </h1>
          </div>
          <p className="font-mono text-xs text-ink/50">Karthik &amp; Likhita</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={clsx(
                "whitespace-nowrap px-4 py-2.5 font-body text-sm font-medium border-b-2 transition-colors",
                active === tab
                  ? "border-rust text-ledger"
                  : "border-transparent text-ink/50 hover:text-ink"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
