"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getCustomerMe,
  customerLogin,
  customerLogout,
  customerSignup,
  verifyEmail,
} from "../lib/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated customer session on startup via HttpOnly cookie
  const refreshCustomer = useCallback(async () => {
    try {
      const response = await getCustomerMe();
      if (response?.data?.customer) {
        setCustomer(response.data.customer);
      } else {
        setCustomer(null);
      }
    } catch {
      // 401 / session expired or unauthenticated
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  const login = async ({ email, password }) => {
    const response = await customerLogin({ email, password });
    if (response?.data?.customer) {
      setCustomer(response.data.customer);
    }
    return response;
  };

  const signup = async ({ name, email, phone, password }) => {
    return customerSignup({ name, email, phone, password });
  };

  const verifyOtp = async ({ email, otp }) => {
    const response = await verifyEmail({ email, otp });
    if (response?.data?.customer) {
      setCustomer(response.data.customer);
    }
    return response;
  };

  const logout = async () => {
    try {
      await customerLogout();
    } catch {
      // ignore logout network errors
    } finally {
      setCustomer(null);
    }
  };

  const updateCustomerState = (updatedCustomer) => {
    setCustomer((prev) => (prev ? { ...prev, ...updatedCustomer } : updatedCustomer));
  };

  const value = {
    customer,
    loading,
    isAuthenticated: Boolean(customer),
    login,
    signup,
    verifyOtp,
    logout,
    refreshCustomer,
    updateCustomerState,
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
