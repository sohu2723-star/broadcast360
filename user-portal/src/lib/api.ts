import axios from "axios";

const api = axios.create({
  // Client requests stay on the portal origin; Next rewrites /api/* to the backend.
  baseURL: "",

  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },

});

export default api;