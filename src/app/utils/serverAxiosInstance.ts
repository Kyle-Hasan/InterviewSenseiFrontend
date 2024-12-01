import axios from "axios";

import { cookies } from "next/headers";

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

export default serverAxiosInstance;
