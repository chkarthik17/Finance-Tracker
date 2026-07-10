"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Invalid code");
        setCode("");
      }
    } catch (err) {
      setError("Failed to login");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-dark-card p-4">
      <div className="gaming-card w-full max-w-md px-6 sm:px-8 py-8 sm:py-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl sm:text-6xl mb-4">🔐</div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
            Expense Tracker
          </h1>
          <p className="text-sm text-gray-400">
            Enter security code to access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Security Code
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 rounded-lg bg-dark-card border-2 border-dark-border text-white text-center text-2xl font-mono tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="••••"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm text-center animate-slide-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 4}
            className="w-full gaming-button text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Verifying..." : "🔓 Unlock"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Session expires after 30 minutes of inactivity
        </p>
      </div>
    </div>
  );
}
