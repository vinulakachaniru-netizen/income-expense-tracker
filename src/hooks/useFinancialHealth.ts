import { useMemo } from "react";
import type { CategoryBudgets } from "./useCategoryBudgets";
import type { Transaction } from "@/types/transaction";

export interface HealthScore {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  streak: number;
  savingsRate: number;
  budgetHealth: string;
  badges: string[];
}

export function useFinancialHealth(
  transactions: Transaction[],
  budgets: CategoryBudgets
): HealthScore {
  return useMemo(() => {
    let score = 500; // Base score
    const badges: string[] = [];

    // 1. Calculate Streak
    // Count unique days with transactions
    const uniqueDays = new Set(
      transactions.map((t) => new Date(t.date).toDateString())
    );
    const streak = uniqueDays.size;
    
    // Add streak points (max 150)
    const streakPoints = Math.min(150, streak * 5);
    score += streakPoints;

    if (streak >= 7) badges.push("🔥 7-Day Streak");
    if (streak >= 30) badges.push("🌟 Monthly Master");

    // 2. Calculate Savings Rate
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const currentMonthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const income = currentMonthTxns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = currentMonthTxns
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    let savingsRate = 0;
    if (income > 0) {
      savingsRate = (income - expenses) / income;
      // Max 250 points for savings (50% savings rate = 250 points)
      if (savingsRate > 0) {
        score += Math.min(250, savingsRate * 500);
      } else {
        score -= 50; // Penalty for negative savings
      }
    }

    if (savingsRate >= 0.2) badges.push("💰 Super Saver");

    // 3. Calculate Budget Adherence
    let budgetHealth = "No budgets set";
    const budgetedCategories = Object.keys(budgets) as (keyof CategoryBudgets)[];
    
    if (budgetedCategories.length > 0) {
      let overBudgetCount = 0;
      let budgetPoints = 0;

      for (const cat of budgetedCategories) {
        const budgetAmount = budgets[cat];
        if (!budgetAmount) continue;

        const spent = currentMonthTxns
          .filter((t) => t.type === "expense" && t.category === cat)
          .reduce((sum, t) => sum + t.amount, 0);

        if (spent <= budgetAmount) {
          budgetPoints += 25; // 25 pts per kept budget
        } else {
          overBudgetCount++;
          budgetPoints -= 15; // Penalty
        }
      }

      // Max 100 points
      score += Math.min(100, budgetPoints);

      if (overBudgetCount === 0) {
        budgetHealth = "All budgets on track!";
        if (budgetedCategories.length >= 3) badges.push("🎯 Budget Sniper");
      } else {
        budgetHealth = `${overBudgetCount} budget(s) exceeded`;
      }
    }

    // Clamp score
    score = Math.max(300, Math.min(1000, Math.round(score)));

    let grade: HealthScore["grade"] = "D";
    if (score >= 850) grade = "A+";
    else if (score >= 700) grade = "A";
    else if (score >= 600) grade = "B";
    else if (score >= 500) grade = "C";

    if (score >= 850) badges.push("👑 Financial Elite");

    return {
      score,
      grade,
      streak,
      savingsRate: savingsRate > 0 ? Math.round(savingsRate * 100) : 0,
      budgetHealth,
      badges,
    };
  }, [transactions, budgets]);
}
