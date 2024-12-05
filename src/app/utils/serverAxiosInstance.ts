import axios from "axios";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const serverAxiosInstance = axios.create({
  baseURL: "http://localhost:5095/api", 
  
  headers: {
    "Content-Type": "application/json", 
  },
  withCredentials: true,
});

serverAxiosInstance.interceptors.request.use(async (config)=> {
  // server side
  if(typeof window === 'undefined') {
    const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value || '';
  const refreshToken = cookieStore.get('refreshToken')?.value || ''
  config.headers['cookie'] = `accessToken=${accessToken}; refreshToken=${refreshToken}`

  }

  return config
})

serverAxiosInstance.interceptors.response.use(
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
         
          return serverAxiosInstance(originalRequest);
        }
      } catch (refreshError) {
       
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

export default serverAxiosInstance;
