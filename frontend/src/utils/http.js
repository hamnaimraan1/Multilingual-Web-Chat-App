// // frontend/src/utils/http.js
// import axios from "axios";

// const BASE = process.env.REACT_APP_BACKEND_URL || "https://localhost:8443";

// export const http = axios.create({
//   baseURL: "https://localhost:8443",   // <- your HTTPS backend port
//   withCredentials: true,
// });

// // Attach token if stored in localStorage as "token"
// http.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
  
// });

// export default http;
// frontend/src/utils/http.js
import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL || "https://localhost:8443";

export const http = axios.create({
  baseURL: BASE, // use BASE constant for flexibility
  withCredentials: true,
});

// Attach token if stored in localStorage as "token"
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Automatically redirect to login on token expiry or 401
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear stored user data and token
      localStorage.removeItem("token");
      localStorage.removeItem("userData");

      // Redirect user to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default http;
