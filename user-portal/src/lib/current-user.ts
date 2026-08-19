import authApi from "@/lib/authapi";
import type { User } from "@/types/user";

let cachedUser: User | null | undefined;
let cachedAt = 0;
let inFlight: Promise<User | null> | null = null;
const CACHE_TTL_MS = 15_000;

export function clearCurrentUserCache() {
  cachedUser = undefined;
  cachedAt = 0;
  inFlight = null;
}

export function getCurrentUser(force = false): Promise<User | null> {
  const fresh = cachedUser !== undefined && Date.now() - cachedAt < CACHE_TTL_MS;
  if (!force && fresh) return Promise.resolve(cachedUser ?? null);
  if (!force && inFlight) return inFlight;

  inFlight = authApi
    .get("/api/user-portal/auth/me")
    .then((response) => {
      const user = (response.data?.user ?? null) as User | null;
      cachedUser = user;
      cachedAt = Date.now();
      return user;
    })
    .catch((error) => {
      cachedUser = undefined;
      cachedAt = 0;
      throw error;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight!;
}
