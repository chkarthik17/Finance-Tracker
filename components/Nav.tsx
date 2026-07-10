"use client";

import clsx from "clsx";

const TABS = ["Ledger", "Entries", "Holdings", "Forecast", "Plans"] as const;
export type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, string> = {
  Ledger: "📊",
  Entries: "💳",
  Holdings: "💼",
  Forecast: "📈",
  Plans: "🎯",
};

export default function Nav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-dark-bg/90 border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div>
            <p className="text-xs text-blue-400/80 tracking-wide uppercase mb-0.5 hidden sm:block">
              Financial Dashboard
            </p>
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">
              The Ledger
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-400">Live</p>
          </div>
        </div>
        <nav className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-3 sm:pb-4 hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={clsx(
                "whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2",
                active === tab
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="text-base sm:text-lg">{TAB_ICONS[tab]}</span>
              <span className="hidden sm:inline">{tab}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
