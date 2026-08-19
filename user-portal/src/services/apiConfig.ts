import { API_ORIGIN, apiUrl } from "@/lib/api-url";

export const ADMIN_API_URL = typeof window === "undefined" ? API_ORIGIN : "";

export const defaultHeaders = {
  "Content-Type": "application/json",
};

export { apiUrl };
