import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5095/api", 
  timeout: 10000, 
  headers: {
    "Content-Type": "application/json", 
  },
  withCredentials: true,
});

export default axiosInstance;
