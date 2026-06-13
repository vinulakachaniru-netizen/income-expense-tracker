"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthGuardProps {
  children: (user: User) => React.ReactNode;
}

/**
 * Checks whether the user is authenticated.
 * - While checking: shows a full-screen spinner
 * - If not logged in: redirects to /login
 * - If logged in: renders children, passing the User object
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
      } else {
        setUser(data.user);
      }
      setChecking(false);
    });

    // Listen for auth state changes (sign in / sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
        setUser(null);
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children(user)}</>;
}
