import { User } from "./types";
import { login } from "@/store/thunks/authThunks";
import { AppDispatch } from "@/store/store";

// Simulate an authentication API
export const authService = {
  login: async (
    email: string,
    password: string,
    dispatch: AppDispatch
  ): Promise<User> => {
    const response = await dispatch(login({ email, password }));
    console.log({ response });
    if (response.payload.user.email) {
      return response.payload.user;
    }
    throw new Error(response.payload.message);
  },

  logout: (): void => {
    localStorage.removeItem("auth_user");
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem("auth_user");
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  },
};
