"use client";

import { Plus, Camera, Loader2 } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { EXPENSE_CATEGORIES } from "@/types/transaction";
import type { TransactionType } from "@/types/transaction";

export interface TransactionFormData {
  description: string;
  amount: string;
  type: TransactionType;
  category: string;
  date: string;
}

interface AddTransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// Helper function to resize images before uploading (prevents Vercel 4.5MB payload limit errors)
function resizeImage(file: File, maxWidth = 1024): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Failed to get canvas context"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Canvas to Blob failed"));
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        }, "image/jpeg", 0.7); // 70% quality JPEG
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function AddTransactionForm({ onSubmit }: AddTransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(todayISO);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError("");

    try {
      // Resize image to avoid Vercel 4.5MB limits and speed up upload
      const compressedFile = await resizeImage(file);

      const formData = new FormData();
      formData.append("receipt", compressedFile);

      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to scan receipt");
      }

      const data = await res.json();
      
      // Populate form
      if (data.description) setDescription(data.description);
      if (data.amount) setAmount(data.amount);
      if (data.category && EXPENSE_CATEGORIES.includes(data.category)) {
        setCategory(data.category);
        setType("expense");
      }
      if (data.date) setDate(data.date);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while scanning the receipt.");
    } finally {
      setIsScanning(false);
      // Reset file input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(amount);
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }
    if (isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid amount in LKR.");
      return;
    }

    onSubmit({ description, amount, type, category, date });
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory(EXPENSE_CATEGORIES[0]);
    setDate(todayISO());
  }

  return (
    <section className="rounded-2xl border border-teal/10 bg-white p-6 shadow-sm relative">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Add Transaction</h2>
        
        {/* Hidden file input */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex items-center gap-1.5 rounded-lg bg-teal/10 px-3 py-1.5 text-sm font-medium text-teal transition-colors hover:bg-teal/20 disabled:opacity-50"
        >
          {isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          {isScanning ? "Scanning..." : "Scan Receipt"}
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Record income or expenses in Sri Lankan Rupees.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-1">
          {(["expense", "income"] as TransactionType[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                type === option
                  ? "bg-teal text-white shadow-sm"
                  : "text-slate-600 hover:text-teal"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Lunch at Pilawoos"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-slate-700">
              Amount (LKR)
            </label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>

          <div>
            <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>
        </div>

        {type === "expense" && (
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add Transaction
        </button>
      </form>
    </section>
  );
}
