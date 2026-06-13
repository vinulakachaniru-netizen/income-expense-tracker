"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExpenseCategory } from "@/types/transaction";

const BUDGETS_KEY = "lanka-expense-category-budgets";

export type CategoryBudgets = Partial<Record<ExpenseCategory, number>>;

export function useCategoryBudgets() {
  const [budgets, setBudgetsState] = useState<CategoryBudgets>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BUDGETS_KEY);
      if (raw) setBudgetsState(JSON.parse(raw) as CategoryBudgets);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const setCategoryBudget = useCallback(
    (category: ExpenseCategory, amount: number | null) => {
      setBudgetsState((prev) => {
        const updated = { ...prev };
        if (!amount || amount <= 0) {
          delete updated[category];
        } else {
          updated[category] = amount;
        }
        try {
          localStorage.setItem(BUDGETS_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [],
  );

  const clearAllBudgets = useCallback(() => {
    setBudgetsState({});
    try {
      localStorage.removeItem(BUDGETS_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { budgets, setCategoryBudget, clearAllBudgets, hydrated };
}
