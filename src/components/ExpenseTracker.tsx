"use client";

import { ActionsPanel } from "@/components/ActionsPanel";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { BIDashboard } from "@/components/BIDashboard";
import { BudgetAlert } from "@/components/BudgetAlert";
import { Header } from "@/components/Header";
import { SpendingInsights } from "@/components/SpendingInsights";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionHistory } from "@/components/TransactionHistory";
import { useUserSettings } from "@/hooks/useUserSettings";
import {
  createTransactionFromForm,
  useTransactions,
} from "@/hooks/useTransactions";

interface ExpenseTrackerProps {
  userId: string;
  userEmail: string;
}

export function ExpenseTracker({ userId, userEmail }: ExpenseTrackerProps) {
  const {
    transactions,
    hydrated: txHydrated,
    addTransaction,
    deleteTransaction,
    clearAllTransactions,
    totals,
    balance,
  } = useTransactions(userId);

  const {
    budget,
    setBudget,
    budgets,
    setCategoryBudget,
    goal,
    setGoal,
    hydrated: settingsHydrated,
  } = useUserSettings(userId);

  if (!txHydrated || !settingsHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <Header
        balance={balance}
        budget={budget}
        totalExpenses={totals.expenses}
        userEmail={userEmail}
        onBudgetSave={setBudget}
      />
      <SummaryCards
        totalIncome={totals.income}
        totalExpenses={totals.expenses}
      />

      {budget !== null && (
        <BudgetAlert budget={budget} totalExpenses={totals.expenses} />
      )}

      <AddTransactionForm
        onSubmit={(data) => {
          const transaction = createTransactionFromForm(data);
          if (transaction) addTransaction(transaction);
        }}
      />

      <SpendingInsights
        transactions={transactions}
        totalIncome={totals.income}
        totalExpenses={totals.expenses}
        savingsGoal={goal}
        onGoalSave={setGoal}
      />

      <BIDashboard
        transactions={transactions}
        budgets={budgets}
        onCategoryBudgetSave={setCategoryBudget}
      />

      <ActionsPanel
        transactions={transactions}
        onClearAll={clearAllTransactions}
      />
      <TransactionHistory
        transactions={transactions}
        onDelete={deleteTransaction}
      />
    </div>
  );
}
