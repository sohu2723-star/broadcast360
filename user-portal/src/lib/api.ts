import axios from "axios";

const api = axios.create({
  // Browser requests stay on the portal origin; Next rewrites /api/* to the backend.
  // Server-rendered pages need an absolute backend URL because relative Axios URLs cannot be resolved on the server.
  baseURL: typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
    : "",

  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },

});

export default api;