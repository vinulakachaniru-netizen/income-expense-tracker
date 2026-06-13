"use client";

import { AlertTriangle, XCircle } from "lucide-react";
import { formatLKR } from "@/lib/currency";

interface BudgetAlertProps {
  budget: number;
  totalExpenses: number;
}

export function BudgetAlert({ budget, totalExpenses }: BudgetAlertProps) {
  if (budget <= 0) return null;

  const percentage = (totalExpenses / budget) * 100;
  const exceeded = percentage >= 100;
  const nearLimit = percentage >= 80 && percentage < 100;

  if (!exceeded && !nearLimit) return null;

  const remaining = budget - totalExpenses;

  if (exceeded) {
    return (
      <div
        role="alert"
        id="budget-exceeded-alert"
        className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 shadow-sm"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20">
          <XCircle className="h-5 w-5 text-rose-400" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-rose-600 dark:text-rose-400">Budget Exceeded!</p>
          <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
            You&apos;ve spent{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{formatLKR(totalExpenses)}</span>{" "}
            — that&apos;s{" "}
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              {formatLKR(Math.abs(remaining))}
            </span>{" "}
            over your{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{formatLKR(budget)}</span> monthly
            budget ({Math.round(percentage)}% used).
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-500"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 80–99%
  return (
    <div
      role="alert"
      id="budget-warning-alert"
      className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 shadow-sm"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
        <AlertTriangle className="h-5 w-5 text-amber-400" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-amber-600 dark:text-amber-400">
          Warning: You have reached 80% of your budget!
        </p>
        <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
          You&apos;ve spent{" "}
          <span className="font-semibold text-slate-900 dark:text-white">{formatLKR(totalExpenses)}</span> of
          your{" "}
          <span className="font-semibold text-slate-900 dark:text-white">{formatLKR(budget)}</span> budget.
          Only{" "}
          <span className="font-semibold text-amber-600 dark:text-amber-400">{formatLKR(remaining)}</span>{" "}
          remaining ({Math.round(percentage)}% used).
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
