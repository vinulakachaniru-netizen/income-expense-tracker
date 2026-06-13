"use client";

import { Download, Trash2 } from "lucide-react";
import type { Transaction } from "@/types/transaction";

interface ActionsPanelProps {
  transactions: Transaction[];
  onClearAll: () => void;
  userId: string;
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

export function ActionsPanel({ transactions, onClearAll, userId }: ActionsPanelProps) {
  function handleClearAll() {
    const confirmed = window.confirm(
      "⚠️ Clear all data?\n\nThis will permanently delete all your transactions from local storage. This action cannot be undone."
    );
    if (confirmed) {
      onClearAll();
    }
  }

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/sms-webhook` : '';

  return (
    <div className="space-y-6">
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

      {/* SMS Webhook Automation Settings */}
      <section className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-xl dark:backdrop-blur-md">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Phone Automation Webhook</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure an Apple Shortcut or Android Tasker to forward bank SMS alerts directly to your database.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Webhook URL</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 block overflow-x-auto rounded-lg bg-slate-100 dark:bg-slate-800 p-2.5 text-sm font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {webhookUrl}
              </code>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your User ID</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 block rounded-lg bg-slate-100 dark:bg-slate-800 p-2.5 text-sm font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {userId}
              </code>
            </div>
          </div>
          <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-4 border border-indigo-100 dark:border-indigo-500/20">
            <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">How to set up:</h4>
            <ol className="mt-2 list-decimal list-inside text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
              <li>Create a new Apple Shortcut Automation for "When I get a message from [Bank Name]".</li>
              <li>Add a "Get contents of URL" action.</li>
              <li>Paste the Webhook URL above. Change method to POST.</li>
              <li>Add a JSON body with: <br/><code className="bg-indigo-100 dark:bg-indigo-500/30 px-1 py-0.5 rounded text-xs">userId</code> = Your User ID above<br/><code className="bg-indigo-100 dark:bg-indigo-500/30 px-1 py-0.5 rounded text-xs">secret</code> = Your secret code (set WEBHOOK_SECRET in Vercel)<br/><code className="bg-indigo-100 dark:bg-indigo-500/30 px-1 py-0.5 rounded text-xs">smsText</code> = Shortcut Input</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
