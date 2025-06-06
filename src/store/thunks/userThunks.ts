import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../config/api";

interface UpdateUserData {
  username?: string;
  email?: string;
  avatar?: string;
}

export const fetchUserDetails = createAsyncThunk(
  "user/fetchDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/user/details"));
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (
    { userId, userData }: { userId: string; userData: UpdateUserData },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user profile");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);
