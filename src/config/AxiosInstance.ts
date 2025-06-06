import axios, { AxiosInstance } from "axios";
import { getApiUrl } from "./api";

// Create main Axios instance
const mainAxiosInstance = axios.create({
  baseURL: getApiUrl(""),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Create alternate Axios instance
export const alternateAxiosInstance = axios.create({
  baseURL: getApiUrl(""),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let cachedToken: string | null = null;
let cachedRefreshToken: string | null = null;

export const setInterceptors = async (axiosInstance: AxiosInstance) => {
  // Get tokens from localStorage
  cachedToken = localStorage.getItem("token");
  cachedRefreshToken = localStorage.getItem("refreshToken");

  axiosInstance.interceptors.request.use(
    (config: any) => {
      if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
      }
      if (cachedRefreshToken) {
        config.headers.refreshToken = cachedRefreshToken;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error?.response?.status === 401) {
        // Clear tokens and redirect to login
        localStorage.clear();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};

export const updateToken = async (newToken: string) => {
  cachedToken = newToken;
  localStorage.setItem("token", newToken);
  mainAxiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;
  alternateAxiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;
};

export default mainAxiosInstance;
