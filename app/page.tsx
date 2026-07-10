"use client";

import { useCallback, useEffect, useState } from "react";
import { entriesAPI, holdingsAPI, plansAPI } from "@/lib/api";
import { Entry, Holding, Plan, Person } from "@/lib/types";
import Nav, { Tab } from "@/components/Nav";
import Dashboard from "@/components/Dashboard";
import Entries from "@/components/Entries";
import Holdings from "@/components/Holdings";
import Forecast from "@/components/Forecast";
import Plans from "@/components/Plans";
import UserToggle from "@/components/UserToggle";
import DateRangeFilter, { DateRange, getDateRangeParams } from "@/components/DateRangeFilter";
import QuickSummary from "@/components/QuickSummary";
import DataManagement from "@/components/DataManagement";

export default function Home() {
  const [tab, setTab] = useState<Tab>("Ledger");
  const [currentUser, setCurrentUser] = useState<Person>("Karthik");
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const dateParams = getDateRangeParams(dateRange);

      const [entriesData, holdingsData, plansData] = await Promise.all([
        entriesAPI.getAll({ ...dateParams, person: currentUser }),
        holdingsAPI.getAll(),
        plansAPI.getAll(),
      ]);

      setEntries(entriesData);
      setHoldings(holdingsData);
      setPlans(plansData);
    } catch (error: any) {
      setLoadError(error.message || "Failed to load data.");
    }
    setLoading(false);
  }, [currentUser, dateRange]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Filter data by current user
  const filteredEntries = entries.filter(e => e.person === currentUser);
  const filteredHoldings = holdings.filter(h => h.person === currentUser);
  const filteredPlans = plans.filter(p => p.person === currentUser || p.person === "Both");

  return (
    <>
      <UserToggle currentUser={currentUser} onToggle={setCurrentUser} />
      <Nav active={tab} onChange={setTab} />
      <main className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 grid-pattern min-h-screen">
        {/* User Header */}
        <div className="mb-4 sm:mb-6 animate-fade-in">
          <div className="gaming-card px-4 sm:px-5 py-3 sm:py-3.5">
            <h1 className="text-lg sm:text-xl font-semibold gradient-text">
              {currentUser}'s Financial Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time expense tracking & management
            </p>
          </div>
        </div>

        {/* Quick Summary Cards */}
        {(tab === "Ledger" || tab === "Entries") && (
          <QuickSummary currentUser={currentUser} />
        )}

        {/* Date Range Filter */}
        {tab === "Entries" && (
          <>
            <DateRangeFilter selected={dateRange} onChange={setDateRange} />
            <DataManagement currentUser={currentUser} onArchiveComplete={loadAll} />
          </>
        )}

        {loadError && (
          <div className="gaming-card border-red-500/50 px-5 py-4 mb-6 text-sm text-red-400 animate-slide-in">
            <span className="text-red-500 font-bold">⚠ Database Error:</span> {loadError}
            <br />
            <span className="text-gray-500 text-xs">
              Check that MONGODB_URI is set correctly in .env.local
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
            </div>
            <p className="text-sm text-gray-400 mt-6 font-gaming animate-pulse">Loading {currentUser}'s data...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {tab === "Ledger" && <Dashboard entries={filteredEntries} holdings={filteredHoldings} />}
            {tab === "Entries" && <Entries entries={filteredEntries} onChanged={loadAll} currentUser={currentUser} />}
            {tab === "Holdings" && <Holdings holdings={filteredHoldings} onChanged={loadAll} />}
            {tab === "Forecast" && <Forecast entries={filteredEntries} holdings={filteredHoldings} />}
            {tab === "Plans" && <Plans plans={filteredPlans} onChanged={loadAll} />}
          </div>
        )}
      </main>
    </>
  );
}
