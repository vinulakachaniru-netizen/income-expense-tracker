"use client";

import { LogOut, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatLKR } from "@/lib/currency";
import { BudgetModal } from "@/components/BudgetModal";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  balance: number;
  budget: number | null;
  totalExpenses: number;
  userEmail: string;
  onBudgetSave: (value: number | null) => void;
}

export function Header({
  balance,
  budget,
  totalExpenses,
  userEmail,
  onBudgetSave,
}: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const budgetPercent =
    budget !== null && budget > 0
      ? Math.min((totalExpenses / budget) * 100, 100)
      : null;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="rounded-2xl bg-teal px-6 py-8 text-white shadow-lg shadow-teal/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-widest text-white/70">
            Sri Lanka
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Lanka-Expense
          </h1>
          {/* Signed-in user */}
          <p className="mt-1 truncate text-xs text-white/60">{userEmail}</p>
        </div>

        {/* Action icons: wallet · budget gear · sign out */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <Wallet className="h-5 w-5" strokeWidth={2} />
          </div>

          <BudgetModal budget={budget} onSave={onBudgetSave} />

          <button
            id="sign-out-btn"
            type="button"
            aria-label="Sign out"
            onClick={handleSignOut}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 active:scale-95"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-white/70">Total Balance</p>
        <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {formatLKR(balance)}
        </p>
      </div>

      {/* Inline budget progress bar */}
      {budget !== null && budgetPercent !== null && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>Monthly Budget</span>
            <span>
              {formatLKR(totalExpenses)} / {formatLKR(budget)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercent >= 100
                  ? "bg-red-400"
                  : budgetPercent >= 80
                    ? "bg-amber-400"
                    : "bg-white/70"
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
