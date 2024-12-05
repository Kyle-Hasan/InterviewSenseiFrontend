import axios from "axios";
import { NextResponse } from "next/server";



const axiosInstance = axios.create({
  baseURL: "http://localhost:5095/api", 
  
  headers: {
    "Content-Type": "application/json", 
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          "http://localhost:5095/api/Auth/refreshToken",
          {},
          { withCredentials: true }
        );

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
