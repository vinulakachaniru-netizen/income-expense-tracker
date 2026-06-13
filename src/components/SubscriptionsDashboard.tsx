import { CalendarDays, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { detectSubscriptions } from "@/lib/subscriptions";
import type { Transaction } from "@/types/transaction";
import { formatLKR } from "@/lib/currency";
import { CATEGORY_COLORS } from "@/lib/chart-colors";

interface Props {
  transactions: Transaction[];
  currentBalance: number;
}

export function SubscriptionsDashboard({ transactions, currentBalance }: Props) {
  const subscriptions = useMemo(() => detectSubscriptions(transactions), [transactions]);

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    if (sub.frequency === "monthly") return sum + sub.amount;
    if (sub.frequency === "weekly") return sum + (sub.amount * 4);
    if (sub.frequency === "yearly") return sum + (sub.amount / 12);
    return sum;
  }, 0);

  const safeBalance = currentBalance - totalMonthlyCost;

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-xl dark:backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Monthly Subscriptions</h2>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
            {formatLKR(totalMonthlyCost)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Detected {subscriptions.length} recurring bill{subscriptions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-transparent p-6 shadow-sm dark:shadow-xl dark:backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Safe to Spend</h2>
          </div>
          <p className="mt-4 text-3xl font-black text-emerald-700 dark:text-emerald-400">
            {formatLKR(safeBalance)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Current balance minus projected monthly bills
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-xl dark:backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Bills Timeline</h3>
        </div>

        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-slate-100 dark:bg-white/5 p-4 mb-3">
              <RefreshCw className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">No subscriptions detected</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              We analyze your history to find recurring payments automatically. Log some identical expenses to see them here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const daysUntil = Math.ceil((new Date(sub.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysUntil < 0;
              const isDueSoon = daysUntil >= 0 && daysUntil <= 5;

              return (
                <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 transition hover:bg-slate-100 dark:hover:bg-slate-900">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-lg shadow-inner"
                      style={{ backgroundColor: CATEGORY_COLORS[sub.category as keyof typeof CATEGORY_COLORS] || '#94a3b8' }}
                    >
                      {sub.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{sub.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {sub.frequency}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className={`text-xs font-medium flex items-center gap-1 ${
                          isOverdue ? "text-red-500" : isDueSoon ? "text-amber-500" : "text-emerald-500"
                        }`}>
                          {isOverdue ? (
                            <><AlertCircle className="w-3 h-3" /> Overdue</>
                          ) : isDueSoon ? (
                            <><AlertCircle className="w-3 h-3" /> Due in {daysUntil} days</>
                          ) : (
                            <><CheckCircle2 className="w-3 h-3" /> Due in {daysUntil} days</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{formatLKR(sub.amount)}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase">
                      Next: {new Date(sub.nextDueDate).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
