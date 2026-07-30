"use client";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import type { User } from "@/types/user";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.get("/api/user-portal/auth/me");

        setUser(res.data.user);
      } catch (error) {
        console.error("Load user failed:", error);

        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return {
    user,

    loading,

    setUser,
  };
}
