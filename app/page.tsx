"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Entry, Holding, Plan } from "@/lib/types";
import Nav, { Tab } from "@/components/Nav";
import Dashboard from "@/components/Dashboard";
import Entries from "@/components/Entries";
import Holdings from "@/components/Holdings";
import Forecast from "@/components/Forecast";
import Plans from "@/components/Plans";

export default function Home() {
  const [tab, setTab] = useState<Tab>("Ledger");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    const [entriesRes, holdingsRes, plansRes] = await Promise.all([
      supabase.from("entries").select("*").order("date", { ascending: false }),
      supabase.from("holdings").select("*").order("created_at", { ascending: true }),
      supabase.from("plans").select("*").order("created_at", { ascending: true }),
    ]);

    if (entriesRes.error || holdingsRes.error || plansRes.error) {
      setLoadError(
        entriesRes.error?.message ||
          holdingsRes.error?.message ||
          plansRes.error?.message ||
          "Failed to load data."
      );
    } else {
      setEntries(entriesRes.data as Entry[]);
      setHoldings(holdingsRes.data as Holding[]);
      setPlans(plansRes.data as Plan[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();

    // Live sync: whenever either of you adds/edits/deletes, the other's
    // screen updates automatically via Supabase Realtime.
    const channel = supabase
      .channel("ledger-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "entries" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "holdings" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "plans" }, loadAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  return (
    <>
      <Nav active={tab} onChange={setTab} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {loadError && (
          <div className="ledger-card border-rust px-5 py-4 mb-6 text-sm text-rust">
            Couldn't reach the database: {loadError}
            <br />
            <span className="text-ink/60 text-xs">
              Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
              are set correctly and that supabase-schema.sql has been run.
            </span>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-ink/50 text-center py-16">Opening the ledger…</p>
        ) : (
          <>
            {tab === "Ledger" && <Dashboard entries={entries} holdings={holdings} />}
            {tab === "Entries" && <Entries entries={entries} onChanged={loadAll} />}
            {tab === "Holdings" && <Holdings holdings={holdings} onChanged={loadAll} />}
            {tab === "Forecast" && <Forecast entries={entries} holdings={holdings} />}
            {tab === "Plans" && <Plans plans={plans} onChanged={loadAll} />}
          </>
        )}
      </main>
    </>
  );
}
