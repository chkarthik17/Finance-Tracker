"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="fixed bottom-4 left-4 z-40 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      title="Logout"
    >
      <span>🔒</span>
      <span className="hidden sm:inline">{loading ? "Logging out..." : "Logout"}</span>
    </button>
  );
}
