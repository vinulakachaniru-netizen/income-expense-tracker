import { Activity, Award, Flame, Target, Trophy } from "lucide-react";
import { useFinancialHealth } from "@/hooks/useFinancialHealth";
import type { CategoryBudgets } from "@/hooks/useCategoryBudgets";
import type { Transaction } from "@/types/transaction";

interface Props {
  transactions: Transaction[];
  budgets: CategoryBudgets;
}

export function FinancialHealthCard({ transactions, budgets }: Props) {
  const health = useFinancialHealth(transactions, budgets);

  // SVG Gauge Calculations
  const radius = 40;
  const circumference = Math.PI * radius; // semi-circle
  const percent = Math.max(0, Math.min(100, ((health.score - 300) / 700) * 100));
  const offset = circumference - (percent / 100) * circumference;

  let scoreColor = "text-emerald-500";
  let trackColor = "stroke-emerald-500";
  if (health.grade === "C" || health.grade === "D") {
    scoreColor = "text-amber-500";
    trackColor = "stroke-amber-500";
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-xl dark:backdrop-blur-md">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal/5 dark:bg-teal/10 blur-3xl" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Financial Health
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Grade: <span className={`font-bold ${scoreColor}`}>{health.grade}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
        {/* Gauge Chart */}
        <div className="relative flex shrink-0 items-end justify-center w-32 h-16">
          <svg className="absolute top-0 h-32 w-32 -rotate-180 transform" viewBox="0 0 100 100">
            {/* Background arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeLinecap="round"
            />
            {/* Value arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`transition-all duration-1000 ease-out ${trackColor}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <span className={`text-3xl font-black tracking-tighter ${scoreColor}`}>
              {health.score}
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400">
              Score
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-medium">App Streak</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{health.streak} Days</span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
              <Target className="h-3.5 w-3.5 text-teal-500" />
              <span className="text-xs font-medium">Savings Rate</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{health.savingsRate}%</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      {health.badges.length > 0 && (
        <div className="mt-5 border-t border-slate-100 dark:border-white/5 pt-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <Award className="h-4 w-4" /> Unlocked Badges
          </p>
          <div className="flex flex-wrap gap-2">
            {health.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-500/5 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 shadow-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
