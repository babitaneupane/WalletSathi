import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Assuming backend runs on 5000
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
