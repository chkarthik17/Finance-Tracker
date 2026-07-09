"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { supabase } from "@/lib/supabase";
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
}: {
  entries: Entry[];
  onChanged: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
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
    setForm(emptyForm);
    setEditingId(null);
  }

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

    const { error: dbError } = editingId
      ? await supabase.from("entries").update(payload).eq("id", editingId)
      : await supabase.from("entries").insert(payload);

    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    resetForm();
    onChanged();
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setForm({
      date: entry.date,
      type: entry.type,
      amount: String(entry.amount),
      category: entry.category,
      person: entry.person,
      note: entry.note || "",
    });
  }

  async function handleDelete(id: string) {
    const { error: dbError } = await supabase.from("entries").delete().eq("id", id);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    if (editingId === id) resetForm();
    onChanged();
  }

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-6">
      <form onSubmit={handleSubmit} className="ledger-card px-5 py-5 h-fit space-y-4">
        <p className="font-display text-lg text-ledger">
          {editingId ? "Edit entry" : "New entry"}
        </p>

        <div className="flex gap-2">
          {(["expense", "income"] as EntryType[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={clsx(
                "flex-1 py-2 text-sm rounded border capitalize",
                form.type === t
                  ? t === "income"
                    ? "bg-ledger text-paper border-ledger"
                    : "bg-rust text-paper border-rust"
                  : "border-line text-ink/60"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Amount (₹)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="mt-1 w-full border border-line rounded px-3 py-2 font-mono bg-paper"
            placeholder="0.00"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="mt-1 w-full border border-line rounded px-3 py-2 bg-paper"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Category</span>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
            className="mt-1 w-full border border-line rounded px-3 py-2 bg-paper"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Who</span>
          <div className="flex gap-2 mt-1">
            {PEOPLE.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setForm((f) => ({ ...f, person: p }))}
                className={clsx(
                  "flex-1 py-2 text-sm rounded border",
                  form.person === p
                    ? "bg-ink text-paper border-ink"
                    : "border-line text-ink/60"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </label>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Note (optional)</span>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="mt-1 w-full border border-line rounded px-3 py-2 bg-paper"
            placeholder="e.g. Swiggy, rent for July"
          />
        </label>

        {error && <p className="text-rust text-xs">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-ledger text-paper py-2.5 rounded text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add entry"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded text-sm border border-line text-ink/60"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="ledger-card px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="font-display text-lg text-ledger">
            All entries ({filtered.length})
          </p>
          <div className="flex gap-2 text-xs">
            <select
              value={filterPerson}
              onChange={(e) => setFilterPerson(e.target.value as any)}
              className="border border-line rounded px-2 py-1 bg-paper"
            >
              <option>All</option>
              {PEOPLE.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border border-line rounded px-2 py-1 bg-paper"
            >
              <option>All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        <div className="space-y-0 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-sm text-ink/50 py-6 text-center">
              No entries match this filter.
            </p>
          )}
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-3 ledger-rule text-sm group"
            >
              <div className="min-w-0">
                <p className="text-ink truncate">
                  {entry.category}
                  {entry.note && (
                    <span className="text-ink/40"> — {entry.note}</span>
                  )}
                </p>
                <p className="text-ink/40 text-xs font-mono">
                  {entry.date} · {entry.person}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p
                  className="font-mono tabular-figures"
                  style={{ color: entry.type === "income" ? "#0F3D2E" : "#B5502A" }}
                >
                  {entry.type === "income" ? "+" : "-"}
                  {formatCurrency(entry.amount)}
                </p>
                <button
                  onClick={() => startEdit(entry)}
                  className="text-xs text-ink/40 hover:text-ink underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-xs text-ink/40 hover:text-rust underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
