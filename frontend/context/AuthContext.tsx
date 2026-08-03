"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const startTime = Date.now();
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch (error) {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      
      const elapsedTime = Date.now() - startTime;
      const minDelay = 3000; // Enforce minimum 3s splash screen delay
      if (elapsedTime < minDelay) {
        setTimeout(() => setLoading(false), minDelay - elapsedTime);
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login" && pathname !== "/register") {
        router.push("/login");
      }
    }
  }, [user, loading, pathname, router]);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    setUser(userData);
    if (userData.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {loading ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
          <div className="relative flex flex-col items-center">
            {/* Pulsing background glow */}
            <div className="absolute inset-0 -m-4 rounded-full bg-emerald-500/20 blur-2xl animate-pulse"></div>
            
            {/* Logo Image */}
            <img 
              src="/logo.png" 
              alt="WalletSathi Logo" 
              className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 object-contain animate-pulse drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
            />
            
            <div className="mt-8 flex flex-col items-center">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
                WalletSathi <span className="text-emerald-500">AI</span>
              </h1>
              <div className="mt-4 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
