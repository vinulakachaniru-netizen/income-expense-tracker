"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { ExpenseTracker } from "@/components/ExpenseTracker";

export default function Home() {
  return (
    <AuthGuard>
      {(user) => <ExpenseTracker userId={user.id} userEmail={user.email ?? ""} />}
    </AuthGuard>
  );
}
