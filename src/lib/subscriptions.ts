import type { Transaction } from "@/types/transaction";

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: "monthly" | "weekly" | "yearly";
  nextDueDate: string; // ISO date string
  confidence: "high" | "medium";
  lastPaidDate: string;
}

export function detectSubscriptions(transactions: Transaction[]): Subscription[] {
  const expenses = transactions.filter((t) => t.type === "expense");
  
  // Group by exact description and amount
  const groups: Record<string, Transaction[]> = {};
  
  for (const t of expenses) {
    const key = `${t.description.toLowerCase().trim()}_${t.amount}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }

  const subscriptions: Subscription[] = [];

  for (const [key, txns] of Object.entries(groups)) {
    // Need at least 2 instances to detect a pattern
    if (txns.length < 2) continue;

    // Sort descending by date
    const sorted = [...txns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Check interval between most recent and second most recent
    const latest = new Date(sorted[0].date);
    const previous = new Date(sorted[1].date);
    
    const diffTime = Math.abs(latest.getTime() - previous.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let frequency: Subscription["frequency"] | null = null;
    let confidence: Subscription["confidence"] = "medium";

    if (diffDays >= 25 && diffDays <= 35) {
      frequency = "monthly";
      if (txns.length >= 3) confidence = "high";
    } else if (diffDays >= 6 && diffDays <= 8) {
      frequency = "weekly";
      if (txns.length >= 4) confidence = "high";
    } else if (diffDays >= 350 && diffDays <= 380) {
      frequency = "yearly";
    }

    if (frequency) {
      // Calculate next due date
      const nextDue = new Date(latest);
      if (frequency === "monthly") nextDue.setMonth(nextDue.getMonth() + 1);
      if (frequency === "weekly") nextDue.setDate(nextDue.getDate() + 7);
      if (frequency === "yearly") nextDue.setFullYear(nextDue.getFullYear() + 1);

      subscriptions.push({
        id: `sub_${key}`,
        name: sorted[0].description,
        amount: sorted[0].amount,
        category: sorted[0].category,
        frequency,
        nextDueDate: nextDue.toISOString(),
        confidence,
        lastPaidDate: latest.toISOString(),
      });
    }
  }

  return subscriptions.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
}
