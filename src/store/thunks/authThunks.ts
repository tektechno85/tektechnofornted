import { createAsyncThunk } from "@reduxjs/toolkit";
import { postAPI } from "@/config/ApiService";

interface Response {
  response: boolean;
  message: string;
  data: any;
  status: string;
  timestamp: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterUserCredentials {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  userType: "SUPER_ADMIN" | "ADMIN" | "USER"; // Using union type for specific values
}

interface LoginResponse {
  response: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: {
      fullName: string;
      email: string;
      mobileNumber: string;
      userType: string;
      status: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

interface RegisterResponse {
  // You can update this interface based on the actual response structure
  success?: boolean;
  message?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    userType: string;
    [key: string]: any;
  };
}

export const login: any = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await postAPI<LoginResponse>(
        "/auth/log-in",
        credentials
      );

      if (response.response) {
        // Store tokens
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(
        typeof (
          error?.response?.data?.data?.details?.[0]?.message ||
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.response?.data
        ) === "string"
          ? error?.response?.data?.data?.details?.[0]?.message ||
              error?.response?.data?.data?.message ||
              error?.response?.data?.message ||
              error?.response?.message ||
              error?.response?.data
          : "Login failed. Please try again."
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (credentials: RegisterUserCredentials, { rejectWithValue }) => {
    try {
      const response = await postAPI<RegisterResponse>(
        "/auth/register/user",
        credentials
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        typeof (
          error?.response?.data?.data?.details?.[0]?.message ||
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.response?.data
        ) === "string"
          ? error?.response?.data?.data?.details?.[0]?.message ||
              error?.response?.data?.data?.message ||
              error?.response?.data?.message ||
              error?.response?.message ||
              error?.response?.data
          : "Registration failed. Please try again."
      );
    }
  }
);
