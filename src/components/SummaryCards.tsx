import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatLKR } from "@/lib/currency";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
}

export function SummaryCards({ totalIncome, totalExpenses }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="group rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-5 shadow-sm dark:shadow-xl dark:backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-md dark:hover:bg-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatLKR(totalIncome, "LKR")}
            </p>
          </div>
        </div>
      </div>

      <div className="group rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-5 shadow-sm dark:shadow-xl dark:backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-md dark:hover:bg-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatLKR(totalExpenses, "LKR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
