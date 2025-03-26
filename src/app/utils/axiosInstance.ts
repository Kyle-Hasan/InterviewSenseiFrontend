import axios from "axios";
import { NextResponse } from "next/server";
import Cookies from "js-cookie"; 

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  maxContentLength: 100000000,
  maxBodyLength: 1000000000,
  withCredentials: true,
  timeout: 30 * 1000,
});

// Request interceptor to attach CSRF token for state-changing requests
axiosInstance.interceptors.request.use((config) => {
  // Only add CSRF token for methods that modify state
  if (["post", "patch", "put", "delete"].includes((config.method || "").toLowerCase())) {
    const csrfToken = Cookies.get("CSRF-TOKEN");
    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
    }
  }
  return config;
});

// Response interceptor for handling refresh token logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error || !error.response) {
      return Promise.reject(error);
    }

    const errorMessage: string = error.response.data || "";

    if (
      error.response &&
      error.response.status === 401 &&
      !errorMessage.toLowerCase().includes("bad login") &&
      !errorMessage.toLowerCase().includes("username taken") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.get(apiUrl + "/Auth/refreshToken", {
          withCredentials: true,
        });

        if (refreshResponse.data) {
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to /login if refresh fails
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        } else {
          return NextResponse.redirect("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
