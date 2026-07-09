"use client";

import { useState } from "react";
import clsx from "clsx";
import { supabase } from "@/lib/supabase";
import { Plan, PEOPLE, Person } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

const emptyForm = {
  name: "",
  target_amount: "",
  saved_amount: "",
  target_date: "",
  person: "Both" as Person | "Both",
};

export default function Plans({
  plans,
  onChanged,
}: {
  plans: Plan[];
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
    const target = parseFloat(form.target_amount);
    const saved = parseFloat(form.saved_amount || "0");
    if (!form.name.trim() || isNaN(target) || target <= 0) {
      setError("Give the plan a name and a target amount above 0.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      target_amount: target,
      saved_amount: isNaN(saved) ? 0 : saved,
      target_date: form.target_date || null,
      person: form.person,
    };
    const { error: dbError } = editingId
      ? await supabase.from("plans").update(payload).eq("id", editingId)
      : await supabase.from("plans").insert(payload);
    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    resetForm();
    onChanged();
  }

  function startEdit(p: Plan) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      target_amount: String(p.target_amount),
      saved_amount: String(p.saved_amount),
      target_date: p.target_date || "",
      person: p.person,
    });
  }

  async function handleDelete(id: string) {
    const { error: dbError } = await supabase.from("plans").delete().eq("id", id);
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
          {editingId ? "Edit plan" : "New savings plan"}
        </p>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Goal name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Goa trip, Emergency fund"
            className="mt-1 w-full border border-line rounded px-3 py-2 bg-paper"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Target amount (₹)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.target_amount}
            onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))}
            className="mt-1 w-full border border-line rounded px-3 py-2 font-mono bg-paper"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Saved so far (₹)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.saved_amount}
            onChange={(e) => setForm((f) => ({ ...f, saved_amount: e.target.value }))}
            className="mt-1 w-full border border-line rounded px-3 py-2 font-mono bg-paper"
          />
        </label>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">Target date (optional)</span>
          <input
            type="date"
            value={form.target_date}
            onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
            className="mt-1 w-full border border-line rounded px-3 py-2 bg-paper"
          />
        </label>

        <label className="block text-sm">
          <span className="text-ink/60 text-xs">For</span>
          <div className="flex gap-2 mt-1">
            {(["Both", ...PEOPLE] as (Person | "Both")[]).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setForm((f) => ({ ...f, person: p }))}
                className={clsx(
                  "flex-1 py-2 text-xs rounded border",
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

        {error && <p className="text-rust text-xs">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-ledger text-paper py-2.5 rounded text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add plan"}
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

      <div className="space-y-4">
        {plans.length === 0 && (
          <div className="ledger-card px-6 py-12 text-center">
            <p className="text-sm text-ink/50">No plans yet — set your first goal.</p>
          </div>
        )}
        {plans.map((p) => {
          const pct = Math.min(100, (p.saved_amount / p.target_amount) * 100);
          return (
            <div key={p.id} className="ledger-card px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-display text-lg text-ledger">{p.name}</p>
                  <p className="text-xs text-ink/40 font-mono">
                    {p.person}
                    {p.target_date ? ` · by ${p.target_date}` : ""}
                  </p>
                </div>
                <p className="font-mono text-sm tabular-figures text-right">
                  {formatCurrency(p.saved_amount)} / {formatCurrency(p.target_amount)}
                </p>
              </div>
              <div className="h-2 bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-ink/40">{pct.toFixed(0)}% funded</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(p)}
                    className="text-xs text-ink/40 hover:text-ink underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-ink/40 hover:text-rust underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
