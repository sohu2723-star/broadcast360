"use client";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import type { User } from "@/types/user";
import authApi from "./authapi";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser(attempt = 0): Promise<void> {
      try {
        const res = await authApi.get("/api/user-portal/auth/me");
        if (cancelled) return;
        setUser(res.data.user ?? null);
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
