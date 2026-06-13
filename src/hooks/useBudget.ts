"use client";

import { useCallback, useEffect, useState } from "react";

const BUDGET_KEY = "lanka-expense-monthly-budget";

export function useBudget() {
  const [budget, setBudgetState] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BUDGET_KEY);
      if (raw !== null) {
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed > 0) setBudgetState(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const setBudget = useCallback((value: number | null) => {
    setBudgetState(value);
    try {
      if (value === null || value <= 0) {
        localStorage.removeItem(BUDGET_KEY);
      } else {
        localStorage.setItem(BUDGET_KEY, String(value));
      }
    } catch {
      // ignore
    }
  }, []);

  return { budget, setBudget, hydrated };
}
