import axios from "axios";
import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


const axiosInstance = axios.create({
  baseURL: apiUrl,

  headers: {
    "Content-Type": "application/json",
  },
  maxContentLength: 100000000,
  maxBodyLength: 1000000000,
  withCredentials: true,
  timeout: 30 * 1000
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorMessage:string = error.response.data|| "";
   
    if (error.response && (error.response.status === 401 && !errorMessage.toLowerCase().includes("bad login") && !errorMessage.toLowerCase().includes("username taken") ) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.get(
          apiUrl + "/Auth/refreshToken",

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
