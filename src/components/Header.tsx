"use client";

import { LogOut, Wallet, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const budgetPercent =
    budget !== null && budget > 0
      ? Math.min((totalExpenses / budget) * 100, 100)
      : null;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 px-6 py-8 text-slate-900 dark:text-white shadow-xl dark:shadow-2xl transition-colors">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-teal/20 blur-[80px]" />
      
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-widest text-slate-500 dark:text-white/70">
            Sri Lanka
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Lanka-Expense
          </h1>
          {/* Signed-in user */}
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-white/60">{userEmail}</p>
        </div>

        {/* Action icons */}
        <div className="flex shrink-0 items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-white/15 text-slate-600 dark:text-white transition-colors hover:bg-slate-200 dark:hover:bg-white/25 active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" strokeWidth={2} /> : <Moon className="h-5 w-5" strokeWidth={2} />}
            </button>
          )}

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-white/15 text-slate-600 dark:text-white">
            <Wallet className="h-5 w-5" strokeWidth={2} />
          </div>

          <BudgetModal budget={budget} onSave={onBudgetSave} />

          <button
            id="sign-out-btn"
            type="button"
            aria-label="Sign out"
            onClick={handleSignOut}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-white/15 text-slate-600 dark:text-white transition-colors hover:bg-slate-200 dark:hover:bg-white/25 active:scale-95"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-slate-500 dark:text-white/70">Total Balance</p>
        <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {formatLKR(balance)}
        </p>
      </div>

      {/* Inline budget progress bar */}
      {budget !== null && budgetPercent !== null && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/70">
            <span>Monthly Budget</span>
            <span>
              {formatLKR(totalExpenses)} / {formatLKR(budget)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/20">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercent >= 100
                  ? "bg-red-400"
                  : budgetPercent >= 80
                    ? "bg-amber-400"
                    : "bg-slate-400 dark:bg-white/70"
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
