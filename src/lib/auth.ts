import { User } from "./types";

// Mock user data for local authentication
export const mockUser: User = {
  id: "u1",
  name: "Alex Johnson",
  email: "bishnu@gmail.com",
  avatar: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=300",
  role: "Admin",
  joinedDate: "2023-04-15"
};

// Simulate an authentication API
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation logic
    if (email === "bishnu@gmail.com" && password === "123456") {
      return mockUser;
    }
    throw new Error("Invalid email or password");
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
  }
};