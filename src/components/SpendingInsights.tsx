"use client";

import {
  BarChart3,
  Calendar,
  ChevronDown,
  PieChart as PieChartIcon,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORY_COLORS, CHART_COLORS } from "@/lib/chart-colors";
import {
  type DateRange,
  filterTransactions,
  getExpensesByCategory,
  getLast7DaysSpending,
  getTopSpendingCategory,
} from "@/lib/chart-data";
import { getCategoryIcon } from "@/lib/categories";
import { formatLKR } from "@/lib/currency";
import type { SavingsGoal } from "@/hooks/useSavingsGoal";
import type { ExpenseCategory, Transaction } from "@/types/transaction";

// ─── Date range config ────────────────────────────────────────────────────────
const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

// ─── Savings goal modal ───────────────────────────────────────────────────────
interface GoalModalProps {
  current: SavingsGoal | null;
  onSave: (g: SavingsGoal | null) => void;
  onClose: () => void;
}

function GoalModal({ current, onSave, onClose }: GoalModalProps) {
  const [label, setLabel] = useState(current?.label ?? "");
  const [target, setTarget] = useState(
    current?.target ? String(current.target) : "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = parseFloat(target);
    if (!label.trim() || isNaN(t) || t <= 0) return;
    onSave({ label: label.trim(), target: t });
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
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/20 text-teal-light">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Set Savings Goal</h3>
            <p className="text-xs text-slate-400">Track progress from your savings</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Goal Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Save for a trip"
              className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Target Amount (LKR)</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="50000"
              min="1"
              step="any"
              className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
              required
            />
          </div>
          <div className="flex gap-3 pt-1">
            {current && (
              <button
                type="button"
                onClick={() => { onSave(null); onClose(); }}
                className="flex-1 rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                Remove Goal
              </button>
            )}
            <button type="submit" className="flex-1 rounded-xl bg-teal py-2.5 text-sm font-medium text-white transition hover:bg-teal/90 active:scale-95">
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Category Deep-Dive panel ─────────────────────────────────────────────────
interface DeepDiveProps {
  category: ExpenseCategory;
  transactions: Transaction[];
  onClose: () => void;
}

function CategoryDeepDive({ category, transactions, onClose }: DeepDiveProps) {
  const Icon = getCategoryIcon(category);
  const catTxns = transactions
    .filter((t) => t.type === "expense" && t.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = catTxns.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-md">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: CATEGORY_COLORS[category] + "18" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: CATEGORY_COLORS[category] }}
          >
            {Icon({ className: "h-4 w-4", strokeWidth: 2 })}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{category} — Deep Dive</p>
            <p className="text-xs text-slate-400">{catTxns.length} transactions · {formatLKR(total)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* List */}
      {catTxns.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No transactions in this period</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {catTxns.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-white">{t.description}</p>
                <p className="text-xs text-slate-400">
                  {new Date(t.date).toLocaleDateString("en-LK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span className="text-sm font-semibold text-white">
                {formatLKR(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// ─── Main component ───────────────────────────────────────────────────────────
interface SpendingInsightsProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  savingsGoal: SavingsGoal | null;
  onGoalSave: (g: SavingsGoal | null) => void;
}

export function SpendingInsights({
  transactions,
  totalIncome,
  totalExpenses,
  savingsGoal,
  onGoalSave,
}: SpendingInsightsProps) {
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  const filtered = filterTransactions(transactions, dateRange, customFrom, customTo);
  const categoryData = getExpensesByCategory(filtered);
  const dailyData = getLast7DaysSpending(filtered);
  const topCategory = getTopSpendingCategory(filtered);
  const hasExpenses = categoryData.length > 0;
  const hasDailySpending = dailyData.some((d) => d.amount > 0);

  const allTimeSavings = Math.max(0, totalIncome - totalExpenses);
  const goalPct = savingsGoal
    ? Math.min(Math.round((allTimeSavings / savingsGoal.target) * 100), 100)
    : 0;

  function handlePieClick(_: unknown, index: number) {
    const clicked = categoryData[index];
    if (!clicked) return;
    setSelectedCategory((prev) =>
      prev === clicked.name ? null : (clicked.name as ExpenseCategory),
    );
  }

  return (
    <>
      {showGoalModal && (
        <GoalModal
          current={savingsGoal}
          onSave={onGoalSave}
          onClose={() => setShowGoalModal(false)}
        />
      )}

      <section className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Spending Insights</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              Visualize where your money goes and how spending trends over time.
            </p>
          </div>
          <button
            id="set-savings-goal-btn"
            type="button"
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-teal/30 bg-teal/5 px-3 py-2 text-xs font-medium text-teal transition hover:bg-teal/10 active:scale-95"
          >
            <Target className="h-3.5 w-3.5" />
            {savingsGoal ? "Edit Goal" : "Set Savings Goal"}
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            {DATE_RANGES.map(({ key, label }) => (
              <button
                key={key}
                id={`date-filter-${key}`}
                type="button"
                onClick={() => { setDateRange(key); setSelectedCategory(null); }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  dateRange === key
                    ? "bg-teal text-white shadow-sm shadow-teal/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {dateRange === "custom" && (
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded-lg border border-white/10 bg-slate-900/50 px-3 py-1.5 text-xs text-white outline-none focus:border-teal focus:ring-1 focus:ring-teal/30"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">To</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded-lg border border-white/10 bg-slate-900/50 px-3 py-1.5 text-xs text-white outline-none focus:border-teal focus:ring-1 focus:ring-teal/30"
                />
              </div>
            </div>
          )}
        </div>

        {/* Top Spending Category */}
        <div className="mt-5">
          <div className="rounded-xl border border-white/5 bg-gradient-to-r from-white/5 to-transparent p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Trophy className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-slate-200">Top Spending Category</p>
            </div>
            {topCategory ? (
              <>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[topCategory.name] }}
                  />
                  <span className="text-xl font-bold text-white">{topCategory.name}</span>
                  <span className="rounded-full bg-teal/20 px-2 py-0.5 text-xs font-semibold text-teal-light">
                    {topCategory.pct}% of spend
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {formatLKR(topCategory.amount)} in the selected period
                </p>
                <div className="mt-3 space-y-2">
                  {categoryData.map((cat) => {
                    const total = categoryData.reduce((s, c) => s + c.value, 0);
                    const pct = total > 0 ? (cat.value / total) * 100 : 0;
                    return (
                      <div key={cat.name} className="flex items-center gap-2 text-xs">
                        <span className="w-20 truncate text-slate-400">{cat.name}</span>
                        <div className="flex-1 rounded-full bg-white/5">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat.name] }}
                          />
                        </div>
                        <span className="w-16 text-right font-medium text-slate-200">
                          {formatLKR(cat.value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No expenses in this period</p>
            )}
          </div>
        </div>

        {/* Savings Goal */}
        {savingsGoal && (
          <div className="mt-5 rounded-xl border border-teal/20 bg-teal/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/20 text-teal-light">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{savingsGoal.label}</p>
                  <p className="text-xs text-slate-400">
                    {formatLKR(allTimeSavings)} saved of {formatLKR(savingsGoal.target)}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-sm font-bold ${
                  goalPct >= 100 ? "bg-emerald-500/20 text-emerald-400" : "bg-teal/20 text-teal-light"
                }`}
              >
                {goalPct}%
              </span>
            </div>
            <div className="mt-3">
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/60">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    goalPct >= 100 ? "bg-emerald-500" : "bg-teal"
                  }`}
                  style={{ width: `${goalPct}%` }}
                />
              </div>
              {goalPct >= 100 ? (
                <p className="mt-1.5 text-center text-xs font-semibold text-emerald-400">
                  🎉 Goal reached! Congratulations!
                </p>
              ) : (
                <p className="mt-1 text-right text-xs text-slate-400">
                  {formatLKR(Math.max(0, savingsGoal.target - allTimeSavings))} remaining
                </p>
              )}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Pie chart — clickable for deep dive */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/20 text-teal-light">
                <PieChartIcon className="h-4 w-4" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-semibold text-white">Expenses by Category</h3>
            </div>
            <p className="mb-3 text-xs text-slate-400">
              Click a slice to see individual transactions ↓
            </p>

            {hasExpenses ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="none"
                    onClick={handlePieClick}
                    style={{ cursor: "pointer" }}
                  >
                    {categoryData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name]}
                        opacity={
                          selectedCategory && selectedCategory !== entry.name
                            ? 0.35
                            : 1
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatLKR(Number(value))}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#f1f5f9",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      fontSize: "13px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center rounded-xl bg-white/5 text-sm text-slate-400">
                No expenses in this period
              </div>
            )}

            {hasExpenses && (
              <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
                {categoryData.map((item) => (
                  <li
                    key={item.name}
                    className={`flex cursor-pointer items-center gap-1.5 text-xs transition ${
                      selectedCategory && selectedCategory !== item.name
                        ? "opacity-40"
                        : "text-slate-300"
                    }`}
                    onClick={() =>
                      setSelectedCategory((prev) =>
                        prev === item.name ? null : (item.name as ExpenseCategory),
                      )
                    }
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[item.name] }}
                    />
                    {item.name}
                  </li>
                ))}
              </ul>
            )}

            {/* Deep-dive panel */}
            {selectedCategory && (
              <CategoryDeepDive
                category={selectedCategory}
                transactions={filtered}
                onClose={() => setSelectedCategory(null)}
              />
            )}
          </div>

          {/* Bar chart */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <BarChart3 className="h-4 w-4" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-semibold text-white">Last 7 Days Spending</h3>
            </div>
            {hasDailySpending ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyData} barCategoryGap="20%">
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value) => formatLKR(Number(value))}
                    labelFormatter={(label) => label}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#f1f5f9",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      fontSize: "13px",
                    }}
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[6, 6, 0, 0]}
                    fill={CHART_COLORS.teal}
                    activeBar={{ fill: CHART_COLORS.saffron }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center rounded-xl bg-white/5 text-sm text-slate-400">
                No daily spending in this period
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
