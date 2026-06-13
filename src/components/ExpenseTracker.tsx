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
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Header
        balance={balance}
        budget={budget}
        totalExpenses={totals.expenses}
        userEmail={userEmail}
        onBudgetSave={setBudget}
      />

      {currentView !== "home" && (
        <button
          onClick={() => setCurrentView("home")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      )}

      {currentView === "home" && (
        <div className="space-y-6">
          <FinancialHealthCard transactions={transactions} budgets={budgets} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button onClick={() => setCurrentView("overview")} className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:-translate-y-1 transition-all shadow-sm hover:shadow-md dark:shadow-xl dark:backdrop-blur-md">
            <div className="h-14 w-14 rounded-full bg-teal/10 dark:bg-teal/20 text-teal-dark dark:text-teal-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <PieChart className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Dashboard Overview</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">Summary cards and budget alerts</p>
          </button>
          
          <button onClick={() => setCurrentView("add")} className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:-translate-y-1 transition-all shadow-sm hover:shadow-md dark:shadow-xl dark:backdrop-blur-md">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <PlusCircle className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Transaction</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">Record expenses, incomes, or scan receipts</p>
          </button>

          <button onClick={() => setCurrentView("history")} className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:-translate-y-1 transition-all shadow-sm hover:shadow-md dark:shadow-xl dark:backdrop-blur-md">
            <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <List className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">History</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">View, search, and manage past transactions</p>
          </button>

          <button onClick={() => setCurrentView("analytics")} className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:-translate-y-1 transition-all shadow-sm hover:shadow-md dark:shadow-xl dark:backdrop-blur-md">
            <div className="h-14 w-14 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <TrendingUp className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Analytics & BI</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">Spending insights, forecasts, and visual charts</p>
          </button>

          <button onClick={() => setCurrentView("subscriptions")} className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:-translate-y-1 transition-all shadow-sm hover:shadow-md dark:shadow-xl dark:backdrop-blur-md">
            <div className="h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <RefreshCw className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Subscriptions</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">Auto-detect bills and upcoming payments</p>
          </button>

          <button onClick={() => setCurrentView("advisor")} className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-transparent bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:-translate-y-1 transition-all shadow-md hover:shadow-lg">
            <div className="h-14 w-14 rounded-full bg-white/20 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
               <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-white">Lanka AI Advisor</h3>
            <p className="text-sm text-white/80 text-center mt-1">Chat with your data using Gemini 1.5</p>
          </button>

          <button onClick={() => setCurrentView("settings")} className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:-translate-y-1 transition-all shadow-sm hover:shadow-md dark:shadow-xl dark:backdrop-blur-md">
            <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Settings className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Settings & Data</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">Clear data and export CSV statements</p>
          </button>
          </div>
        </div>
      )}

      {currentView === "overview" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <SummaryCards totalIncome={totals.income} totalExpenses={totals.expenses} />
          {budget !== null && <BudgetAlert budget={budget} totalExpenses={totals.expenses} />}
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
        <div className="max-w-2xl mx-auto space-y-6">
          <ActionsPanel transactions={transactions} onClearAll={clearAllTransactions} />
        </div>
      )}
    </div>
  );
}
