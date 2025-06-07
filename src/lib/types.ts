export interface User {
  fullName: string;
  email: string;
  mobileNumber: string;
  userType: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface LoginFormData {
  email: string;
  password: string;
}
