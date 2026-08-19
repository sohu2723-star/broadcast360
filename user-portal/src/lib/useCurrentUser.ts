"use client";

import { useEffect, useState } from "react";



import type { User } from "@/types/user";
import { getCurrentUser } from "@/lib/current-user";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser(attempt = 0): Promise<void> {
      try {
        const currentUser = await getCurrentUser(attempt > 0);
        if (cancelled) return;
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        if (attempt < 2) {
          window.setTimeout(() => void loadUser(attempt + 1), 250);
          return;
        }
        console.error("Load user failed after retries:", error);
        setUser(null);
        setLoading(false);
      }
    }

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    user,

    loading,

    setUser,
  };
}
