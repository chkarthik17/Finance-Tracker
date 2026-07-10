"use client";

import { useState } from "react";
import { entriesAPI } from "@/lib/api";
import { Person } from "@/lib/types";

interface DataManagementProps {
  currentUser: Person;
  onArchiveComplete: () => void;
}

export default function DataManagement({ currentUser, onArchiveComplete }: DataManagementProps) {
  const [archiving, setArchiving] = useState(false);
  const [archiveResult, setArchiveResult] = useState<string | null>(null);

  async function handleExportCSV() {
    try {
      await entriesAPI.exportCSV(currentUser);
    } catch (error: any) {
      alert("Failed to export: " + error.message);
    }
  }

  async function handleArchiveOldData() {
    const confirmed = window.confirm(
      "⚠️ This will:\n\n" +
      "1. Export all your data to CSV\n" +
      "2. Delete entries older than 2 months\n\n" +
      "Are you sure you want to continue?"
    );

    if (!confirmed) return;

    setArchiving(true);
    setArchiveResult(null);

    try {
      // First, export the data
      await entriesAPI.exportCSV(currentUser);

      // Wait a moment for download to start
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate cutoff date (2 months ago)
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 2);
      const cutoffStr = cutoffDate.toISOString().slice(0, 10);

      // Archive old data
      const result = await entriesAPI.archive(cutoffStr, currentUser);

      setArchiveResult(`✅ Success! Deleted ${result.deletedCount} old entries. CSV downloaded.`);
      onArchiveComplete();
    } catch (error: any) {
      setArchiveResult(`❌ Error: ${error.message}`);
    }

    setArchiving(false);
  }

  return (
    <div className="gaming-card px-4 sm:px-5 py-4 sm:py-5 mb-4 sm:mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
            📊 Data Management
          </h3>
          <p className="text-xs text-gray-400">
            Export & archive your expense data
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <span>📥</span>
            <span>Download CSV</span>
          </button>
          <button
            onClick={handleArchiveOldData}
            disabled={archiving}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
          >
            <span>🗑️</span>
            <span>{archiving ? "Archiving..." : "Archive Old Data"}</span>
          </button>
        </div>
      </div>

      {archiveResult && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          archiveResult.startsWith("✅")
            ? "bg-green-500/10 border border-green-500/50 text-green-400"
            : "bg-red-500/10 border border-red-500/50 text-red-400"
        }`}>
          {archiveResult}
        </div>
      )}
    </div>
  );
}
