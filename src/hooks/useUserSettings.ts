"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ExpenseCategory } from "@/types/transaction";
import type { SavingsGoal } from "./useSavingsGoal";
import type { CategoryBudgets } from "./useCategoryBudgets";

interface UserSettings {
  monthly_budget: number | null;
  category_budgets: CategoryBudgets;
  savings_goal: SavingsGoal | null;
}

export function useUserSettings(userId: string) {
  const supabase = createClient();
  const [settings, setSettings] = useState<UserSettings>({
    monthly_budget: null,
    category_budgets: {},
    savings_goal: null,
  });
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch settings on mount or when userId changes
  useEffect(() => {
    if (!userId) {
      setHydrated(true);
      setLoading(false);
      return;
    }

    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 means no rows found (which is fine for new users)
          console.error("Error fetching user settings:", error);
        } else if (data) {
          setSettings({
            monthly_budget: data.monthly_budget ? Number(data.monthly_budget) : null,
            category_budgets: (data.category_budgets || {}) as CategoryBudgets,
            savings_goal: (data.savings_goal || null) as SavingsGoal | null,
          });
        }
      } catch (err) {
        console.error("Unexpected error fetching settings:", err);
      } finally {
        setHydrated(true);
        setLoading(false);
      }
    }

    fetchSettings();
  }, [userId, supabase]);

  // Helper to upsert partial settings
  const updateSettings = useCallback(
    async (partial: Partial<UserSettings>) => {
      if (!userId) return;

      // Optimistic UI update
      setSettings((prev) => ({ ...prev, ...partial }));

      try {
        // Upsert into Supabase
        const { error } = await supabase
          .from("user_settings")
          .upsert({
            user_id: userId,
            ...partial,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (error) {
          console.error("Error updating settings:", error);
          // Optional: revert optimistic update here on failure
        }
      } catch (err) {
        console.error("Unexpected error updating settings:", err);
      }
    },
    [userId, supabase]
  );

  // Expose specific setters to match previous API signatures
  const setBudget = useCallback(
    (value: number | null) => updateSettings({ monthly_budget: value }),
    [updateSettings]
  );

  const setGoal = useCallback(
    (value: SavingsGoal | null) => updateSettings({ savings_goal: value }),
    [updateSettings]
  );

  const setCategoryBudget = useCallback(
    (category: ExpenseCategory, amount: number | null) => {
      setSettings((prev) => {
        const newCatBudgets = { ...prev.category_budgets };
        if (!amount || amount <= 0) {
          delete newCatBudgets[category];
        } else {
          newCatBudgets[category] = amount;
        }
        
        // Push update to DB
        updateSettings({ category_budgets: newCatBudgets });
        
        return { ...prev, category_budgets: newCatBudgets };
      });
    },
    [updateSettings]
  );

  const clearAllBudgets = useCallback(() => {
    updateSettings({ category_budgets: {} });
  }, [updateSettings]);

  return {
    budget: settings.monthly_budget,
    setBudget,
    budgets: settings.category_budgets,
    setCategoryBudget,
    clearAllBudgets,
    goal: settings.savings_goal,
    setGoal,
    hydrated,
    loading,
  };
}
