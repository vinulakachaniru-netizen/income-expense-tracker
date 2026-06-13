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
        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-5 w-5 text-red-600" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-red-700">Budget Exceeded!</p>
          <p className="mt-0.5 text-sm text-red-600">
            You&apos;ve spent{" "}
            <span className="font-semibold">{formatLKR(totalExpenses)}</span>{" "}
            — that&apos;s{" "}
            <span className="font-semibold">
              {formatLKR(Math.abs(remaining))}
            </span>{" "}
            over your{" "}
            <span className="font-semibold">{formatLKR(budget)}</span> monthly
            budget ({Math.round(percentage)}% used).
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-red-200">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-500"
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
      className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
        <AlertTriangle className="h-5 w-5 text-amber-600" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-amber-700">
          Warning: You have reached 80% of your budget!
        </p>
        <p className="mt-0.5 text-sm text-amber-700">
          You&apos;ve spent{" "}
          <span className="font-semibold">{formatLKR(totalExpenses)}</span> of
          your{" "}
          <span className="font-semibold">{formatLKR(budget)}</span> budget.
          Only{" "}
          <span className="font-semibold">{formatLKR(remaining)}</span>{" "}
          remaining ({Math.round(percentage)}% used).
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-amber-200">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
