"use client";

import { Settings, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatLKR } from "@/lib/currency";

interface BudgetModalProps {
  budget: number | null;
  onSave: (value: number | null) => void;
}

export function BudgetModal({ budget, onSave }: BudgetModalProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Sync input when modal opens
  useEffect(() => {
    if (open) {
      setInputValue(budget !== null ? String(budget) : "");
      // Focus input on next tick
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, budget]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) setOpen(false);
  }

  function handleSave() {
    const parsed = parseFloat(inputValue);
    if (inputValue.trim() === "") {
      onSave(null);
    } else if (!isNaN(parsed) && parsed > 0) {
      onSave(parsed);
    }
    setOpen(false);
  }

  function handleClear() {
    setInputValue("");
    onSave(null);
    setOpen(false);
  }

  const previewBudget = parseFloat(inputValue);
  const isValid =
    inputValue.trim() === "" ||
    (!isNaN(previewBudget) && previewBudget > 0);

  return (
    <>
      {/* Gear button in header */}
      <button
        id="open-budget-settings-btn"
        type="button"
        aria-label="Budget Settings"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 active:scale-95"
      >
        <Settings className="h-5 w-5" strokeWidth={2} />
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-labelledby="budget-modal-title"
        >
          <div
            ref={dialogRef}
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10 text-teal">
                  <Settings className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2
                  id="budget-modal-title"
                  className="text-lg font-semibold text-slate-800"
                >
                  Monthly Budget
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Set a monthly spending limit. You&apos;ll get alerted at 80% and
              100% of your budget.
            </p>

            {/* Current budget pill */}
            {budget !== null && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal-light px-3 py-1.5 text-sm text-teal">
                <span className="font-medium">Current:</span>
                <span className="font-semibold">{formatLKR(budget)}</span>
              </div>
            )}

            {/* Input */}
            <div className="mt-5">
              <label
                htmlFor="budget-input"
                className="block text-sm font-medium text-slate-700"
              >
                Monthly Budget (LKR)
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                  Rs.
                </span>
                <input
                  ref={inputRef}
                  id="budget-input"
                  type="number"
                  min="1"
                  step="1000"
                  placeholder="e.g. 50000"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && isValid && handleSave()}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              {!isValid && (
                <p className="mt-1.5 text-xs text-red-500">
                  Please enter a positive number.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              {budget !== null && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.98]"
                >
                  Remove Budget
                </button>
              )}
              <button
                type="button"
                disabled={!isValid}
                onClick={handleSave}
                className="flex-1 rounded-xl bg-teal py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
