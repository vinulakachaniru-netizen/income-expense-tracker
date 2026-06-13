import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatLKR } from "@/lib/currency";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
}

export function SummaryCards({ totalIncome, totalExpenses }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-teal/10 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <ArrowDownLeft className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Income</p>
            <p className="text-xl font-bold text-emerald-600">
              {formatLKR(totalIncome, "LKR")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-teal/10 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
            <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Expenses</p>
            <p className="text-xl font-bold text-red-500">
              {formatLKR(totalExpenses, "LKR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
