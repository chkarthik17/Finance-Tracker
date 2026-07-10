"use client";

import { useState } from "react";
import clsx from "clsx";
import { holdingsAPI } from "@/lib/api";
import { Holding, PEOPLE, Person } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

const emptyForm = {
  name: "",
  person: "Karthik" as Person,
  invested: "",
  current_value: "",
};

export default function Holdings({
  holdings,
  onChanged,
}: {
  holdings: Holding[];
  onChanged: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const invested = parseFloat(form.invested);
    const currentValue = parseFloat(form.current_value);
    if (!form.name.trim()) {
      setError("Name the holding, e.g. 'Nifty 50 Index Fund'.");
      return;
    }
    if (isNaN(invested) || invested < 0 || isNaN(currentValue) || currentValue < 0) {
      setError("Enter valid amounts for invested and current value.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      person: form.person,
      invested,
      current_value: currentValue,
      updated_at: new Date().toISOString(),
    };
    try {
      if (editingId) {
        await holdingsAPI.update(editingId, payload);
      } else {
        await holdingsAPI.create(payload as any);
      }
      resetForm();
      onChanged();
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  }

  function startEdit(h: Holding) {
    setEditingId(h.id);
    setForm({
      name: h.name,
      person: h.person,
      invested: String(h.invested),
      current_value: String(h.current_value),
    });
  }

  async function handleDelete(id: string) {
    try {
      await holdingsAPI.delete(id);
      if (editingId === id) resetForm();
      onChanged();
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Calculate totals
  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + h.current_value, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="gaming-card px-3 sm:px-4 py-3 sm:py-4">
            <p className="text-xs text-gray-400 mb-1">Invested</p>
            <p className="text-sm sm:text-lg font-bold text-white">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="gaming-card px-3 sm:px-4 py-3 sm:py-4">
            <p className="text-xs text-gray-400 mb-1">Current</p>
            <p className="text-sm sm:text-lg font-bold text-blue-400">{formatCurrency(totalCurrent)}</p>
          </div>
          <div className="gaming-card px-3 sm:px-4 py-3 sm:py-4">
            <p className="text-xs text-gray-400 mb-1">Gain</p>
            <p className={`text-sm sm:text-lg font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[360px_1fr] gap-4 sm:gap-6">
        <form onSubmit={handleSubmit} className="gaming-card px-4 sm:px-5 py-5 h-fit space-y-4 animate-slide-in">
          <p className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {editingId ? "✏️ Edit Holding" : "➕ New Holding"}
          </p>

          <label className="block text-sm">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Nifty 50 Index Fund"
              className="mt-2 w-full border-2 border-dark-border rounded-lg px-4 py-3 bg-dark-card text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Who</span>
            <div className="flex gap-2 mt-2">
              {PEOPLE.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setForm((f) => ({ ...f, person: p }))}
                  className={clsx(
                    "flex-1 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all duration-300",
                    form.person === p
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg"
                      : "border-dark-border bg-dark-card text-gray-400 hover:border-purple-500/50 hover:text-white"
                  )}
                >
                  {p === "Karthik" ? "👨 " : "👩 "}{p}
                </button>
              ))}
            </div>
          </label>

          <label className="block text-sm">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Amount Invested (₹)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.invested}
              onChange={(e) => setForm((f) => ({ ...f, invested: e.target.value }))}
              className="mt-2 w-full border-2 border-dark-border rounded-lg px-4 py-3 font-mono bg-dark-card text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Current Value (₹)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.current_value}
              onChange={(e) => setForm((f) => ({ ...f, current_value: e.target.value }))}
              className="mt-2 w-full border-2 border-dark-border rounded-lg px-4 py-3 font-mono bg-dark-card text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              required
            />
          </label>

          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm animate-slide-in">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 gaming-button text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "⏳ Saving…" : editingId ? "💾 Save Changes" : "➕ Add Holding"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-lg text-sm font-semibold border-2 border-dark-border text-gray-400 hover:border-red-500/50 hover:text-red-400 transition-all"
              >
                ✖️ Cancel
              </button>
            )}
          </div>
        </form>

        <div className="gaming-card px-4 sm:px-5 py-5 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              💼 Holdings ({holdings.length})
            </p>
            {holdings.length > 0 && (
              <div className="text-xs text-gray-400">
                {totalGainPct >= 0 ? '📈' : '📉'} {totalGainPct.toFixed(1)}%
              </div>
            )}
          </div>
          <div className="space-y-2">
            {holdings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💼</div>
                <p className="text-gray-400 text-sm">No holdings tracked yet</p>
              </div>
            )}
            {holdings.map((h) => {
              const gain = h.current_value - h.invested;
              const gainPct = h.invested > 0 ? (gain / h.invested) * 100 : 0;
              return (
                <div key={h.id} className="p-4 rounded-lg bg-dark-card border border-dark-border hover:border-blue-500/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{h.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">👤 {h.person}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-mono text-lg font-bold text-white">{formatCurrency(h.current_value)}</p>
                      <p className={`text-sm font-mono ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-dark-border">
                    <button
                      onClick={() => startEdit(h)}
                      className="text-xs text-gray-400 hover:text-blue-400 underline transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="text-xs text-gray-400 hover:text-red-400 underline transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
