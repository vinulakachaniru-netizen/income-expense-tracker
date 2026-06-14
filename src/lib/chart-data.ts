import type { ExpenseCategory, Transaction } from "@/types/transaction";
import { EXPENSE_CATEGORIES } from "@/types/transaction";

export interface CategoryChartItem {
  name: ExpenseCategory;
  value: number;
}

export interface DailySpendingItem {
  date: string;
  label: string;
  amount: number;
}

export type DateRange = "today" | "week" | "month" | "custom";

// ─── Monthly Comparison ───────────────────────────────────────────────────────
export interface MonthlyComparisonRow {
  category: string;
  thisMonth: number;
  lastMonth: number;
}

export interface MonthlyComparison {
  overall: { thisMonth: number; lastMonth: number };
  byCategory: MonthlyComparisonRow[];
  thisMonthLabel: string;
  lastMonthLabel: string;
}

export function getMonthlyComparison(
  transactions: Transaction[],
): MonthlyComparison {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
  lastMonthEnd.setHours(23, 59, 59, 999);

  const thisMonthCats: Record<string, number> = Object.fromEntries(
    EXPENSE_CATEGORIES.map((c) => [c, 0]),
  );
  const lastMonthCats: Record<string, number> = Object.fromEntries(
    EXPENSE_CATEGORIES.map((c) => [c, 0]),
  );
  let thisMonthTotal = 0;
  let lastMonthTotal = 0;

  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const d = new Date(t.date);
    if (d >= thisMonthStart) {
      thisMonthTotal += t.amount;
      if (t.category in thisMonthCats) thisMonthCats[t.category] += t.amount;
    } else if (d >= lastMonthStart && d <= lastMonthEnd) {
      lastMonthTotal += t.amount;
      if (t.category in lastMonthCats) lastMonthCats[t.category] += t.amount;
    }
  }

  const byCategory = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    thisMonth: thisMonthCats[cat],
    lastMonth: lastMonthCats[cat],
  })).filter((row) => row.thisMonth > 0 || row.lastMonth > 0);

  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  return {
    overall: { thisMonth: thisMonthTotal, lastMonth: lastMonthTotal },
    byCategory,
    thisMonthLabel: monthNames[now.getMonth()],
    lastMonthLabel: monthNames[(now.getMonth() + 11) % 12],
  };
}

// ─── Date filter helper ───────────────────────────────────────────────────────
function getDateBounds(
  range: DateRange,
  customFrom?: string,
  customTo?: string,
): { from: Date; to: Date } {
  const now = new Date();
  const startOfDay = (d: Date) => { d.setHours(0, 0, 0, 0); return d; };

  switch (range) {
    case "today": {
      const from = startOfDay(new Date());
      const to = new Date(); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    case "week": {
      const from = startOfDay(new Date()); from.setDate(from.getDate() - 6);
      const to = new Date(); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    case "month": {
      const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      const to = new Date(); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    case "custom": {
      const from = customFrom
        ? startOfDay(new Date(customFrom))
        : startOfDay(new Date(0));
      const to = customTo ? new Date(customTo) : new Date();
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }
  }
}

export function filterTransactions(
  transactions: Transaction[],
  range: DateRange,
  customFrom?: string,
  customTo?: string,
): Transaction[] {
  const { from, to } = getDateBounds(range, customFrom, customTo);
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= from && d <= to;
  });
}

// ─── Category breakdown ───────────────────────────────────────────────────────
export function getExpensesByCategory(
  transactions: Transaction[],
): CategoryChartItem[] {
  const totals = Object.fromEntries(
    EXPENSE_CATEGORIES.map((cat) => [cat, 0]),
  ) as Record<ExpenseCategory, number>;

  for (const t of transactions) {
    if (t.type === "expense" && t.category in totals) {
      totals[t.category as ExpenseCategory] += t.amount;
    }
  }

  return EXPENSE_CATEGORIES.map((name) => ({
    name,
    value: totals[name],
  })).filter((item) => item.value > 0);
}

// ─── Top spending category ────────────────────────────────────────────────────
export function getTopSpendingCategory(
  transactions: Transaction[],
): { name: ExpenseCategory; amount: number; pct: number } | null {
  const data = getExpensesByCategory(transactions);
  if (!data.length) return null;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const total = data.reduce((s, d) => s + d.value, 0);
  const top = sorted[0];
  return {
    name: top.name,
    amount: top.value,
    pct: total > 0 ? Math.round((top.value / total) * 100) : 0,
  };
}

// ─── Last 7 Days Spending ─────────────────────────────────────────────────────
function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-LK", { weekday: "short" });
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getLast7DaysSpending(
  transactions: Transaction[],
): DailySpendingItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: DailySpendingItem[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    days.push({ date: toDateKey(day), label: formatDayLabel(day), amount: 0 });
  }

  const dayMap = Object.fromEntries(days.map((d) => [d.date, d]));
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const txDateKey = toDateKey(new Date(t.date));
    const entry = dayMap[txDateKey];
    if (entry) entry.amount += t.amount;
  }
  return days;
}

// ─── Future Forecast (Average Daily Spend × Remaining Days) ──────────────────
export type ForecastConfidence = "high" | "medium" | "low";

export interface ForecastResult {
  /** Average Rs. spent per day over the last 90 days (excl. current month) */
  avgDailySpend: number;
  /** Spending already recorded in the current month */
  currentMonthSpend: number;
  /** currentMonthSpend + avgDailySpend × daysRemainingInMonth */
  predictedMonthEndSpend: number;
  /** Total calendar days analysed for the average */
  daysAnalyzed: number;
  /** Days left in the current month after today */
  daysRemainingInMonth: number;
  /** Days in the current month that actually had expense data */
  activeDaysInWindow: number;
  confidence: ForecastConfidence;
  /** Name of current month, e.g. "June" */
  currentMonthName: string;
}

export function getForecast(transactions: Transaction[]): ForecastResult | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Window: start of the month that is 3 months back → yesterday
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Days remaining after today until the last day of this month
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const daysRemainingInMonth = lastDayOfMonth - now.getDate();
  const daysAnalyzed = Math.round(
    (thisMonthStart.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Split transactions
  const historicalExpenses = transactions.filter((t) => {
    if (t.type !== "expense") return false;
    const d = new Date(t.date);
    return d >= windowStart && d < thisMonthStart;
  });

  const currentMonthExpenses = transactions.filter((t) => {
    if (t.type !== "expense") return false;
    const d = new Date(t.date);
    return d >= thisMonthStart;
  });

  const historicalTotal = historicalExpenses.reduce(
    (s, t) => s + t.amount,
    0,
  );
  const currentMonthSpend = currentMonthExpenses.reduce(
    (s, t) => s + t.amount,
    0,
  );

  if (historicalTotal === 0 || daysAnalyzed === 0) return null;

  // Distinct days in the window that had at least one expense
  const activeDaysInWindow = new Set(
    historicalExpenses.map((t) => t.date),
  ).size;

  const avgDailySpend = historicalTotal / daysAnalyzed;
  const predictedMonthEndSpend =
    currentMonthSpend + avgDailySpend * daysRemainingInMonth;

  // Confidence: high if we have ≥60 days of data with ≥20 active days,
  //             medium if ≥30 days or ≥10 active, otherwise low.
  let confidence: ForecastConfidence = "low";
  if (daysAnalyzed >= 60 && activeDaysInWindow >= 20) confidence = "high";
  else if (daysAnalyzed >= 30 || activeDaysInWindow >= 10) confidence = "medium";

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  return {
    avgDailySpend,
    currentMonthSpend,
    predictedMonthEndSpend,
    daysAnalyzed,
    daysRemainingInMonth,
    activeDaysInWindow,
    confidence,
    currentMonthName: monthNames[now.getMonth()],
  };
}
