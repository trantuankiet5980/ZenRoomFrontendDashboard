import axios from "axios";
import { showToast } from "../utils/toast";

const BASE_URL = process.env.REACT_APP_API_URL;
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// interceptor request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// interceptor response
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!error?.response) return Promise.reject(error);
    const status = error.response.status;
    const url = error.config?.url || "";

    const isLoginCall = url.includes("/v1/auth/login");


    if ((status === 401 || status === 403) && !isLoginCall) {
      showToast("info", "Phiên đã hết hạn, vui lòng đăng nhập lại.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("expiresAt");
      window.location.href = "/login";
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);
