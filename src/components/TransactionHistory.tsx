"use client";

import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatLKR } from "@/lib/currency";
import { getCategoryIcon } from "@/lib/categories";
import type { Transaction } from "@/types/transaction";

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TransactionHistory({
  transactions,
  onDelete,
}: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Transaction History
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {transactions.length === 0
              ? "No transactions yet. Add your first one above."
              : `${transactions.length} transaction${transactions.length === 1 ? "" : "s"} recorded.`}
          </p>
        </div>
      </div>

      {/* Search bar */}
      {transactions.length > 0 && (
        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            strokeWidth={2}
          />
          <input
            id="transaction-search"
            type="search"
            placeholder="Search by description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900/50 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-teal focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal/20 transition-colors"
          />
        </div>
      )}

      {/* Results */}
      {transactions.length > 0 && filtered.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-400">
          No transactions match &ldquo;{searchQuery}&rdquo;.
        </p>
      )}

      {filtered.length > 0 && (
        <ul className="mt-6 divide-y divide-white/5">
          {filtered.map((transaction) => {
            const Icon = getCategoryIcon(transaction.category);
            const isIncome = transaction.type === "income";

            return (
              <li
                key={transaction.id}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    isIncome ? "bg-emerald-500/10 text-emerald-400" : "bg-teal/20 text-teal-light"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">
                    {transaction.description}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {transaction.category} · {formatDate(transaction.date)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p
                    className={`whitespace-nowrap text-sm font-semibold ${
                      isIncome ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatLKR(transaction.amount)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDelete(transaction.id)}
                    aria-label={`Delete ${transaction.description}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Filtered count hint */}
      {searchQuery && filtered.length > 0 && filtered.length < transactions.length && (
        <p className="mt-4 text-xs text-slate-400 text-right">
          Showing {filtered.length} of {transactions.length} transactions
        </p>
      )}
    </section>
  );
}
