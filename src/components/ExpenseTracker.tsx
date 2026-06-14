"use client";

import { useState } from "react";
import { ArrowLeft, PieChart, PlusCircle, List, TrendingUp, Settings, RefreshCw, Sparkles } from "lucide-react";

import { ActionsPanel } from "@/components/ActionsPanel";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { AIFinancialAdvisor } from "@/components/AIFinancialAdvisor";
import { BIDashboard } from "@/components/BIDashboard";
import { BudgetAlert } from "@/components/BudgetAlert";
import { FinancialHealthCard } from "@/components/FinancialHealthCard";
import { Header } from "@/components/Header";
import { SpendingInsights } from "@/components/SpendingInsights";
import { SubscriptionsDashboard } from "@/components/SubscriptionsDashboard";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionHistory } from "@/components/TransactionHistory";
import { BottomNav } from "@/components/BottomNav";
import { useUserSettings } from "@/hooks/useUserSettings";
import {
  createTransactionFromForm,
  useTransactions,
} from "@/hooks/useTransactions";

interface ExpenseTrackerProps {
  userId: string;
  userEmail: string;
}

type View = "home" | "overview" | "add" | "history" | "analytics" | "subscriptions" | "advisor" | "settings";

export function ExpenseTracker({ userId, userEmail }: ExpenseTrackerProps) {
  const [currentView, setCurrentView] = useState<View>("home");

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
    <div className="mx-auto w-full max-w-md min-h-screen pb-28 space-y-6 px-4 pt-6 sm:px-6">
      <Header
        balance={balance}
        budget={budget}
        totalExpenses={totals.expenses}
        userEmail={userEmail}
        onBudgetSave={setBudget}
      />
      {currentView === "home" && (
        <div className="space-y-6">
          {/* Top level stats */}
          <SummaryCards totalIncome={totals.income} totalExpenses={totals.expenses} />
          
          {/* Health & Streaks */}
          <FinancialHealthCard transactions={transactions} budgets={budgets} />
          
          {/* Budget Alert if any */}
          {budget !== null && <BudgetAlert budget={budget} totalExpenses={totals.expenses} />}

          {/* Recent Transactions Preview */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
              <button 
                onClick={() => setCurrentView("history")}
                className="text-sm font-medium text-teal-600 dark:text-teal-400"
              >
                See All
              </button>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 px-4 py-2 shadow-sm dark:shadow-xl dark:backdrop-blur-md">
               <TransactionHistory transactions={transactions.slice(0, 5)} onDelete={deleteTransaction} hideHeader={true} />
            </div>
          </div>
        </div>
      )}

      {currentView === "add" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <AddTransactionForm
            onSubmit={(data) => {
              const transaction = createTransactionFromForm(data);
              if (transaction) {
                addTransaction(transaction);
                setCurrentView("history");
              }
            }}
          />
        </div>
      )}

      {currentView === "history" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <TransactionHistory transactions={transactions} onDelete={deleteTransaction} />
        </div>
      )}

      {currentView === "analytics" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <SpendingInsights
            transactions={transactions}
            totalIncome={totals.income}
            totalExpenses={totals.expenses}
            savingsGoal={goal}
            onGoalSave={setGoal}
          />
          <BIDashboard transactions={transactions} budgets={budgets} onCategoryBudgetSave={setCategoryBudget} />
        </div>
      )}

      {currentView === "subscriptions" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <SubscriptionsDashboard transactions={transactions} currentBalance={balance} />
        </div>
      )}

      {currentView === "advisor" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <AIFinancialAdvisor transactions={transactions} budgets={budgets} goal={goal} />
        </div>
      )}

      {currentView === "settings" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
          </div>
          <button onClick={() => setCurrentView("subscriptions")} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm active:scale-95 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400">
                <RefreshCw className="h-5 w-5" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">Manage Subscriptions</span>
            </div>
            <span className="text-slate-400">→</span>
          </button>
          <ActionsPanel transactions={transactions} onClearAll={clearAllTransactions} userId={userId} />
        </div>
      )}

      <BottomNav currentView={currentView} onChangeView={setCurrentView} />
    </div>
  );
}
