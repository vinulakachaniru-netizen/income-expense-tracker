"use client";

import { Download, Trash2 } from "lucide-react";
import type { Transaction } from "@/types/transaction";

interface ActionsPanelProps {
  transactions: Transaction[];
  onClearAll: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(transactions: Transaction[]) {
  const headers = ["Date", "Description", "Category", "Type", "Amount (LKR)"];
  const rows = transactions.map((t) => [
    escapeCSV(formatDate(t.date)),
    escapeCSV(t.description),
    escapeCSV(t.category),
    escapeCSV(t.type === "income" ? "Income" : "Expense"),
    escapeCSV(t.amount.toFixed(2)),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n"
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lanka-expense-statement-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ActionsPanel({ transactions, onClearAll }: ActionsPanelProps) {
  function handleClearAll() {
    const confirmed = window.confirm(
      "⚠️ Clear all data?\n\nThis will permanently delete all your transactions from local storage. This action cannot be undone."
    );
    if (confirmed) {
      onClearAll();
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-xl dark:backdrop-blur-md">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Actions</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Manage your expense data and export records.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {/* Download CSV */}
        <button
          id="download-csv-btn"
          type="button"
          onClick={() => downloadCSV(transactions)}
          disabled={transactions.length === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-teal/20 dark:border-teal/50 bg-teal/5 dark:bg-teal/20 px-4 py-2.5 text-sm font-semibold text-teal-dark dark:text-teal-light shadow-sm transition-all hover:bg-teal/10 dark:hover:bg-teal/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-4 w-4 shrink-0" strokeWidth={2} />
          Download Statement (CSV)
        </button>

        {/* Clear All Data */}
        <button
          id="clear-all-data-btn"
          type="button"
          onClick={handleClearAll}
          disabled={transactions.length === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 shadow-sm transition-all hover:border-rose-300 dark:hover:border-rose-500/40 hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
          Clear All Data
        </button>
      </div>
    </section>
  );
}
