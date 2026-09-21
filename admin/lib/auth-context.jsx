"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAdminMe, loginAdmin, logoutAdmin } from "./api/auth";

const AuthContext = createContext({
  admin: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshAdmin: async () => {},
});

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchSession = useCallback(async () => {
    try {
      const data = await getAdminMe();
      if (data) {
        setAdmin(data);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async ({ email, password }) => {
    const adminData = await loginAdmin({ email, password });
    setAdmin(adminData);
    return adminData;
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } catch {
      // Continue client-side logout even if network error
    }
    setAdmin(null);
    router.replace("/login");
  };

  const value = {
    admin,
    loading,
    isAuthenticated: Boolean(admin),
    login,
    logout,
    refreshAdmin: fetchSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
