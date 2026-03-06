import React, { createContext, useContext, useState, useCallback } from "react";
import { Account } from "@/lib/api";

interface AuthState {
  isAuthenticated: boolean;
  account: Account | null;
  login: (account: Account) => void;
  logout: () => void;
  updateAccount: (account: Account) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(() => {
    const stored = sessionStorage.getItem("bank_account");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((acc: Account) => {
    setAccount(acc);
    sessionStorage.setItem("bank_account", JSON.stringify(acc));
  }, []);

  const logout = useCallback(() => {
    setAccount(null);
    sessionStorage.removeItem("bank_account");
  }, []);

 const updateAccount = useCallback((acc: Account) => {
  setAccount(prev => {
    const updated = prev ? { ...prev, ...acc } : acc;
    sessionStorage.setItem("bank_account", JSON.stringify(updated));
    return updated;
  });
}, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!account, account, login, logout, updateAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
