export type TransactionType = "income" | "expense";

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Rent"
  | "Bills"
  | "Entertainment";

export type Category = ExpenseCategory | "Income";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Rent",
  "Bills",
  "Entertainment",
];
