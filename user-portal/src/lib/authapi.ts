import axios from "axios";

const authApi = axios.create({
  // Same-origin requests are rewritten to the backend by next.config.ts.
  // This keeps user_token first-party on localhost:3001 and the Production portal.
  baseURL: "",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

authApi.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default authApi;