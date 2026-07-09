"use client";

import { useState } from "react";
import clsx from "clsx";
import { supabase } from "@/lib/supabase";
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
    const { error: dbError } = editingId
      ? await supabase.from("holdings").update(payload).eq("id", editingId)
      : await supabase.from("holdings").insert(payload);
    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    resetForm();
    onChanged();
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
    const { error: dbError } = await supabase.from("holdings").delete().eq("id", id);
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
          {editingId ? "Edit holding" : "New holding"}
        </p>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Nifty 50 Index Fund"
            className="mt-1 w-full border border-line rounded px-3 py-2 bg-paper"
            required
          />
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
          <span className="text-ink/60 text-xs">Amount invested (₹)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.invested}
            onChange={(e) => setForm((f) => ({ ...f, invested: e.target.value }))}
            className="mt-1 w-full border border-line rounded px-3 py-2 font-mono bg-paper"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Current value (₹)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.current_value}
            onChange={(e) => setForm((f) => ({ ...f, current_value: e.target.value }))}
            className="mt-1 w-full border border-line rounded px-3 py-2 font-mono bg-paper"
            required
          />
        </label>

        {error && <p className="text-rust text-xs">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-ledger text-paper py-2.5 rounded text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add holding"}
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
        <p className="font-display text-lg text-ledger mb-4">
          Holdings ({holdings.length})
        </p>
        <div className="space-y-0">
          {holdings.length === 0 && (
            <p className="text-sm text-ink/50 py-6 text-center">
              No holdings tracked yet.
            </p>
          )}
          {holdings.map((h) => {
            const gain = h.current_value - h.invested;
            const gainPct = h.invested > 0 ? (gain / h.invested) * 100 : 0;
            return (
              <div key={h.id} className="py-3 ledger-rule">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-ink">{h.name}</p>
                    <p className="text-ink/40 text-xs font-mono">{h.person}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono tabular-figures">
                      {formatCurrency(h.current_value)}
                    </p>
                    <p
                      className="text-xs font-mono tabular-figures"
                      style={{ color: gain >= 0 ? "#0F3D2E" : "#B5502A" }}
                    >
                      {gain >= 0 ? "+" : ""}
                      {formatCurrency(gain)} ({gainPct.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-1">
                  <button
                    onClick={() => startEdit(h)}
                    className="text-xs text-ink/40 hover:text-ink underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-xs text-ink/40 hover:text-rust underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
