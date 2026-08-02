"use client";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import type { User } from "@/types/user";
import authApi from "./authapi";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
          console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
        const res = await authApi.get("/api/user-portal/auth/me");

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
