"use client";

import { useCallback, useEffect, useState } from "react";

const GOAL_KEY = "lanka-expense-savings-goal";

export interface SavingsGoal {
  label: string;  // e.g. "Save for a trip"
  target: number; // e.g. 50000
}

export function useSavingsGoal() {
  const [goal, setGoalState] = useState<SavingsGoal | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GOAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavingsGoal;
        if (parsed.target > 0 && parsed.label) setGoalState(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const setGoal = useCallback((value: SavingsGoal | null) => {
    setGoalState(value);
    try {
      if (!value || value.target <= 0) {
        localStorage.removeItem(GOAL_KEY);
      } else {
        localStorage.setItem(GOAL_KEY, JSON.stringify(value));
      }
    } catch {
      // ignore
    }
  }, []);

  return { goal, setGoal, hydrated };
}
