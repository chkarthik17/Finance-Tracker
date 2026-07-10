"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { entriesAPI } from "@/lib/api";
import { CATEGORIES, Category, Entry, EntryType, PEOPLE, Person } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  type: "expense" as EntryType,
  amount: "",
  category: "Other" as Category,
  person: "Karthik" as Person,
  note: "",
};

export default function Entries({
  entries,
  onChanged,
  currentUser,
}: {
  entries: Entry[];
  onChanged: () => void;
  currentUser: Person;
}) {
  const [form, setForm] = useState({ ...emptyForm, person: currentUser });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterPerson, setFilterPerson] = useState<"All" | Person>("All");
  const [filterType, setFilterType] = useState<"All" | EntryType>("All");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return [...entries]
      .filter((e) => filterPerson === "All" || e.person === filterPerson)
      .filter((e) => filterType === "All" || e.type === filterType)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [entries, filterPerson, filterType]);

  function resetForm() {
    setForm({ ...emptyForm, person: currentUser });
    setEditingId(null);
  }

  // Update form person when currentUser changes
  useEffect(() => {
    setForm(prev => ({ ...prev, person: currentUser }));
  }, [currentUser]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    setSaving(true);
    const payload = {
      date: form.date,
      type: form.type,
      amount,
      category: form.category,
      person: form.person,
      note: form.note || null,
    };

    try {
      if (editingId) {
        await entriesAPI.update(editingId, payload);
      } else {
        await entriesAPI.create(payload as any);
      }
      resetForm();
      onChanged();
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  }

  function startEdit(entry: Entry) {
    // Prevent editing entries that don't belong to current user
    if (entry.person !== currentUser) {
      setError(`You cannot edit ${entry.person}'s entries. Switch to ${entry.person}'s dashboard to edit.`);
      return;
    }
    setEditingId(entry.id);
    setForm({
      date: entry.date,
      type: entry.type,
      amount: String(entry.amount),
      category: entry.category,
      person: currentUser, // Always use current user
      note: entry.note || "",
    });
  }

  async function handleDelete(id: string) {
    const entry = entries.find(e => e.id === id);
    // Prevent deleting entries that don't belong to current user
    if (entry && entry.person !== currentUser) {
      setError(`You cannot delete ${entry.person}'s entries. Switch to ${entry.person}'s dashboard to delete.`);
      return;
    }
    try {
      await entriesAPI.delete(id);
      if (editingId === id) resetForm();
      onChanged();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-4 sm:gap-6">
      <form onSubmit={handleSubmit} className="gaming-card px-4 sm:px-6 py-5 sm:py-6 h-fit space-y-4 sm:space-y-5 animate-slide-in">
        <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {editingId ? "✏️ Edit Entry" : "➕ New Entry"}
        </p>

        <div className="flex gap-2 sm:gap-3">
          {(["expense", "income"] as EntryType[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={clsx(
                "flex-1 py-2.5 sm:py-3 text-sm font-semibold rounded-lg border-2 capitalize transition-all duration-300",
                form.type === t
                  ? t === "income"
                    ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-500 shadow-lg"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-lg"
                  : "border-dark-border bg-dark-card text-gray-400 hover:border-blue-500/50 hover:text-white"
              )}
            >
              <span className="text-base sm:text-lg">{t === "income" ? "💰" : "💸"}</span>
              <span className="ml-1 sm:ml-2">{t}</span>
            </button>
          ))}
        </div>

        <label className="block text-sm">
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Amount (₹)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="mt-2 w-full border-2 border-dark-border rounded-lg px-4 py-3 font-mono bg-dark-card text-white focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all outline-none"
            placeholder="0.00"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="mt-2 w-full border-2 border-dark-border rounded-lg px-4 py-3 bg-dark-card text-white focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all outline-none"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Category</span>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
            className="mt-2 w-full border-2 border-dark-border rounded-lg px-4 py-3 bg-dark-card text-white focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all outline-none cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-dark-card">
                {c}
              </option>
            ))}
          </select>
        </label>

        {/* WHO field - auto-filled from toggle */}
        <div className="bg-dark-bg/50 border-2 border-neon-blue/20 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Adding for:</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentUser === "Karthik" ? "👨" : "👩"}</span>
              <span className="text-white font-gaming font-bold">{currentUser}</span>
              <div className={`w-2 h-2 rounded-full ml-2 ${
                currentUser === "Karthik" ? "bg-neon-blue" : "bg-neon-purple"
              }`} style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            💡 Use the toggle button at the top-right to switch users
          </p>
        </div>

        <label className="block text-sm">
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Note (optional)</span>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="mt-2 w-full border-2 border-dark-border rounded-lg px-4 py-3 bg-dark-card text-white focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all outline-none placeholder-gray-600"
            placeholder="e.g. Swiggy, rent for July"
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
            className="flex-1 gaming-button text-white py-3 rounded-lg text-sm font-gaming font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "⏳ Saving…" : editingId ? "💾 Save Changes" : "➕ Add Entry"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 rounded-lg text-sm font-gaming font-semibold border-2 border-dark-border text-gray-400 hover:border-red-500/50 hover:text-red-400 transition-all"
            >
              ✖️ Cancel
            </button>
          )}
        </div>
      </form>

      <div className="gaming-card px-4 sm:px-6 py-5 sm:py-6 animate-slide-in">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <p className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              📊 All Entries
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
              {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border-2 border-dark-border rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 bg-dark-card text-white focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="All">🔄 All</option>
              <option value="income">💰 Income</option>
              <option value="expense">💸 Expense</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400 text-sm font-gaming">
                No entries found
              </p>
            </div>
          )}
          {filtered.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 rounded-lg bg-dark-card border border-dark-border hover:border-neon-blue/50 transition-all duration-300 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold truncate flex items-center gap-2">
                  <span className="text-xl">{entry.type === "income" ? "💰" : "💸"}</span>
                  {entry.category}
                  {entry.note && (
                    <span className="text-gray-500 font-normal"> — {entry.note}</span>
                  )}
                </p>
                <p className="text-gray-400 text-xs font-mono mt-1">
                  📅 {entry.date} · 👤 {entry.person}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <p
                  className={`font-mono tabular-figures text-lg font-bold ${
                    entry.type === "income" ? "text-neon-green" : "text-neon-pink"
                  }`}
                >
                  {entry.type === "income" ? "+" : "-"}
                  {formatCurrency(entry.amount)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(entry)}
                    className="text-xs text-gray-400 hover:text-neon-blue underline font-gaming transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-xs text-gray-400 hover:text-red-400 underline font-gaming transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
