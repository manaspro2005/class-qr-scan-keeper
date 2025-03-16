
import { createContext, useContext } from "react";
import { User } from "@/types";

// Create auth context
export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: 'teacher' | 'student') => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isTeacher: () => boolean;
  isStudent: () => boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isTeacher: () => false,
  isStudent: () => false,
});

export const useAuth = () => useContext(AuthContext);
