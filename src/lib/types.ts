export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinedDate: string;
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