"use client";

import {
  BarChart3,
  Settings2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORY_COLORS, CHART_COLORS } from "@/lib/chart-colors";
import { getExpensesByCategory, getForecast, getMonthlyComparison } from "@/lib/chart-data";
import { formatLKR } from "@/lib/currency";
import type { CategoryBudgets } from "@/hooks/useCategoryBudgets";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/transaction";
import type { Transaction } from "@/types/transaction";

// ─── Budget Settings Modal ────────────────────────────────────────────────────
interface BudgetModalProps {
  budgets: CategoryBudgets;
  onSave: (cat: ExpenseCategory, amount: number | null) => void;
  onClose: () => void;
}

function BudgetSettingsModal({ budgets, onSave, onClose }: BudgetModalProps) {
  const [draft, setDraft] = useState<Partial<Record<ExpenseCategory, string>>>(
    () =>
      Object.fromEntries(
        EXPENSE_CATEGORIES.map((c) => [c, budgets[c] ? String(budgets[c]) : ""]),
      ) as Partial<Record<ExpenseCategory, string>>,
  );

  function handleSave() {
    for (const cat of EXPENSE_CATEGORIES) {
      const raw = draft[cat] ?? "";
      const parsed = parseFloat(raw);
      onSave(cat, isNaN(parsed) || parsed <= 0 ? null : parsed);
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/20 text-teal-light">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Category Budgets</h3>
            <p className="text-xs text-slate-400">Set a monthly limit per category</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {EXPENSE_CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              <label className="w-28 shrink-0 text-sm font-medium text-slate-300">
                {cat}
              </label>
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  Rs.
                </span>
                <input
                  id={`budget-input-${cat}`}
                  type="number"
                  min="0"
                  placeholder="No limit"
                  value={draft[cat] ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [cat]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-slate-900/50 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          id="save-category-budgets-btn"
          type="button"
          onClick={handleSave}
          className="mt-5 w-full rounded-xl bg-teal py-2.5 text-sm font-semibold text-white transition hover:bg-teal/90 active:scale-95"
        >
          Save Budgets
        </button>
      </div>
    </div>
  );
}

// ─── Budget Variance Row ──────────────────────────────────────────────────────
interface VarianceRowProps {
  category: ExpenseCategory;
  spent: number;
  budget: number;
}

function VarianceRow({ category, spent, budget }: VarianceRowProps) {
  const pct = Math.min((spent / budget) * 100, 100);
  const overspent = spent > budget;
  const variance = budget - spent;

  return (
    <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[category] }}
          />
          <span className="font-medium text-slate-200 text-sm">{category}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {overspent ? (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          )}
          <span
            className={`text-xs font-semibold ${
              overspent ? "text-red-500" : "text-emerald-600"
            }`}
          >
            {overspent ? "Over by " : "Left: "}
            {formatLKR(Math.abs(variance))}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overspent ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-teal"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>{formatLKR(spent)} spent</span>
          <span>{Math.round(pct)}% of {formatLKR(budget)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
function MonthlyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 p-3 shadow-lg text-xs">
      <p className="mb-2 font-semibold text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: {formatLKR(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Main BI Dashboard ────────────────────────────────────────────────────────
interface BIDashboardProps {
  transactions: Transaction[];
  budgets: CategoryBudgets;
  onCategoryBudgetSave: (cat: ExpenseCategory, amount: number | null) => void;
}

export function BIDashboard({
  transactions,
  budgets,
  onCategoryBudgetSave,
}: BIDashboardProps) {
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const monthly = getMonthlyComparison(transactions);
  const diff = monthly.overall.thisMonth - monthly.overall.lastMonth;
  const diffPct =
    monthly.overall.lastMonth > 0
      ? Math.abs(Math.round((diff / monthly.overall.lastMonth) * 100))
      : null;
  const isHigher = diff > 0;

  // Category spending this month (for variance)
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthTxns = transactions.filter(
    (t) => t.type === "expense" && new Date(t.date) >= thisMonthStart,
  );
  const categorySpend = getExpensesByCategory(thisMonthTxns);
  const spendMap = Object.fromEntries(
    categorySpend.map((c) => [c.name, c.value]),
  );

  const budgetedCategories = EXPENSE_CATEGORIES.filter(
    (cat) => budgets[cat] !== undefined,
  );

  const forecast = getForecast(transactions);

  return (
    <>
      {showBudgetModal && (
        <BudgetSettingsModal
          budgets={budgets}
          onSave={onCategoryBudgetSave}
          onClose={() => setShowBudgetModal(false)}
        />
      )}

      <section className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              BI Dashboard
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              Monthly comparison, budget variance &amp; trends.
            </p>
          </div>
        </div>

        {/* ── 1. Monthly Comparison ─────────────────────────────────────────── */}
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/20 text-teal-light">
              <BarChart3 className="h-4 w-4" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Monthly Comparison —{" "}
              <span className="font-normal text-slate-400">
                {monthly.lastMonthLabel} vs {monthly.thisMonthLabel}
              </span>
            </h3>
          </div>

          {/* Summary pills */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              {
                label: monthly.lastMonthLabel,
                value: monthly.overall.lastMonth,
                color: "text-slate-300",
                bg: "bg-slate-900/50",
              },
              {
                label: monthly.thisMonthLabel,
                value: monthly.overall.thisMonth,
                color: "text-teal-light",
                bg: "bg-teal/20",
              },
              {
                label: "Change",
                value: Math.abs(diff),
                color: isHigher ? "text-rose-400" : "text-emerald-400",
                bg: isHigher ? "bg-rose-500/10" : "bg-emerald-500/10",
                prefix: isHigher ? "▲ " : "▼ ",
                suffix: diffPct !== null ? ` (${diffPct}%)` : "",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl p-3 ${item.bg}`}
              >
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className={`mt-1 text-sm font-bold ${item.color}`}>
                  {"prefix" in item ? item.prefix : ""}
                  {formatLKR(item.value)}
                  {"suffix" in item ? item.suffix : ""}
                </p>
              </div>
            ))}
          </div>

          {monthly.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={monthly.byCategory}
                barCategoryGap="25%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                  }
                  width={38}
                />
                <Tooltip content={<MonthlyTooltip />} />
                <Legend
                  formatter={(value) =>
                    value === "lastMonth"
                      ? monthly.lastMonthLabel
                      : monthly.thisMonthLabel
                  }
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                />
                <Bar
                  dataKey="lastMonth"
                  name="lastMonth"
                  fill={CHART_COLORS.saffronLight}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="thisMonth"
                  name="thisMonth"
                  fill={CHART_COLORS.teal}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[240px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
              Add expenses across two months to see a comparison
            </div>
          )}
        </div>

        {/* ── 2. Budget Variance ────────────────────────────────────────────── */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Settings2 className="h-4 w-4" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Category Budget Variance
              </h3>
            </div>
            <button
              id="open-budget-settings-btn"
              type="button"
              onClick={() => setShowBudgetModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-teal/30 bg-teal/5 px-3 py-1.5 text-xs font-medium text-teal transition hover:bg-teal/10 active:scale-95"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Set Budgets
            </button>
          </div>

          {budgetedCategories.length === 0 ? (
            <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-xl bg-slate-900/50 text-sm text-slate-400">
              <Settings2 className="h-5 w-5 opacity-40" />
              <p>Click &ldquo;Set Budgets&rdquo; to add category limits</p>
            </div>
          ) : (
            <div className="space-y-3">
              {budgetedCategories.map((cat) => (
                <VarianceRow
                  key={cat}
                  category={cat}
                  spent={spendMap[cat] ?? 0}
                  budget={budgets[cat]!}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 3. Future Forecast ───────────────────────────────────────────── */}
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-semibold text-white">Future Forecast</h3>
          </div>

          {forecast ? (
            <div className="overflow-hidden rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-900/20 to-transparent">
              {/* Main predicted number */}
              <div className="px-5 pt-5">
                <p className="text-xs font-medium uppercase tracking-widest text-violet-400">
                  Predicted {forecast.currentMonthName} Month-End Spend
                </p>
                <p className="mt-1.5 text-3xl font-bold tracking-tight text-white">
                  {formatLKR(forecast.predictedMonthEndSpend)}
                </p>

                {/* Confidence badge */}
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
                  bg-slate-900/50 border
                  " style={{
                    borderColor:
                      forecast.confidence === "high" ? "rgba(22, 163, 74, 0.2)" :
                      forecast.confidence === "medium" ? "rgba(217, 119, 6, 0.2)" : "rgba(220, 38, 38, 0.2)",
                    color:
                      forecast.confidence === "high" ? "#4ade80" :
                      forecast.confidence === "medium" ? "#fbbf24" : "#f87171",
                  }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{
                    backgroundColor:
                      forecast.confidence === "high" ? "#16a34a" :
                      forecast.confidence === "medium" ? "#d97706" : "#dc2626",
                  }} />
                  {forecast.confidence === "high" ? "High confidence" :
                   forecast.confidence === "medium" ? "Medium confidence" : "Low confidence — add more data"}
                </div>
              </div>

              {/* Progress: current vs predicted */}
              <div className="mt-4 px-5">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Spent so far this month</span>
                  <span className="text-white">{formatLKR(forecast.currentMonthSpend)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-violet-500/10">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-700"
                    style={{
                      width: forecast.predictedMonthEndSpend > 0
                        ? `${Math.min((forecast.currentMonthSpend / forecast.predictedMonthEndSpend) * 100, 100)}%`
                        : "0%",
                    }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-500">
                  {forecast.daysRemainingInMonth} day{forecast.daysRemainingInMonth !== 1 ? "s" : ""} remaining in month
                </p>
              </div>

              {/* Stats row */}
              <div className="mt-4 grid grid-cols-3 divide-x divide-violet-500/10 border-t border-violet-500/10">
                {[
                  {
                    label: "Avg Daily Spend",
                    value: formatLKR(forecast.avgDailySpend),
                  },
                  {
                    label: "Days Analysed",
                    value: `${forecast.daysAnalyzed} days`,
                  },
                  {
                    label: "Active Days",
                    value: `${forecast.activeDaysInWindow} days`,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="px-4 py-3 text-center">
                    <p className="text-xs text-slate-400">{stat.label}</p>
                    <p className="mt-0.5 text-sm font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Methodology note */}
              <p className="px-5 pb-4 pt-2 text-xs text-slate-400">
                Forecast = current spend + (avg daily spend × days left).
                Avg daily spend is computed from the last 90 days of historical data.
                Replace with a TensorFlow/Python model later for higher accuracy.
              </p>
            </div>
          ) : (
            <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-violet-900/20 text-sm text-slate-400">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <p>Add expenses over multiple months to unlock the forecast</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
