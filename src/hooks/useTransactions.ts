"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction, TransactionType } from "@/types/transaction";

// ─── Supabase row shape (snake_case) ────────────────────────────────────────
interface TransactionRow {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  created_at: string;
}

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type as TransactionType,
    category: row.category as Transaction["category"],
    date: row.date,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useTransactions(userId: string) {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load all transactions for this user on mount
  useEffect(() => {
    if (!userId) return;

    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setTransactions((data as TransactionRow[]).map(rowToTransaction));
        }
        setHydrated(true);
      });
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Add a transaction
  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, "id">) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          type: transaction.type,
          date: transaction.date,
        })
        .select()
        .single();

      if (!error && data) {
        setTransactions((prev) => [
          rowToTransaction(data as TransactionRow),
          ...prev,
        ]);
      }
    },
    [userId, supabase],
  );

  // Delete a single transaction
  const deleteTransaction = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", userId); // belt-and-suspenders (RLS also enforces this)

      if (!error) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    },
    [userId, supabase],
  );

  // Clear all transactions for this user
  const clearAllTransactions = useCallback(async () => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId);

    if (!error) {
      setTransactions([]);
    }
  }, [userId, supabase]);

  // Computed totals
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === "income") {
          acc.income += t.amount;
        } else {
          acc.expenses += t.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 },
    );
  }, [transactions]);

  const balance = totals.income - totals.expenses;

  // Sort descending by date for display
  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );

  return {
    transactions: sortedTransactions,
    hydrated,
    addTransaction,
    deleteTransaction,
    clearAllTransactions,
    totals,
    balance,
  };
}

// ─── Form helper (unchanged) ─────────────────────────────────────────────────
export function createTransactionFromForm(data: {
  description: string;
  amount: string;
  type: TransactionType;
  category: string;
  date: string;
}): Omit<Transaction, "id"> | null {
  const amount = parseFloat(data.amount);
  if (!data.description.trim() || isNaN(amount) || amount <= 0) {
    return null;
  }

  return {
    description: data.description.trim(),
    amount,
    type: data.type,
    category:
      data.type === "income"
        ? "Income"
        : (data.category as Transaction["category"]),
    date: data.date,
  };
}
