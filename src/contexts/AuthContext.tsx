import React, { createContext, useContext, useState, useEffect } from "react";
import { api, clearTokens } from "@/lib/api";
import Cookies from "js-cookie";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  location: string;
  organization: string;
  avatarUrl: string | null;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  updateUser: (user: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get("/user/me");
        if (response.data.success) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.delete("/auth/logout");
    } catch (e) {
      console.error("Logout API failed", e);
    } finally {
      clearTokens();
      setUser(null);
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
  };

  const updateUser = (updatedData: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
