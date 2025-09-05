// frontend/src/utils/http.js
import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const http = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

// Attach token if stored in localStorage as "token"
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
