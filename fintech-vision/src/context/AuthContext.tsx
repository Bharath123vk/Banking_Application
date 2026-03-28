import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Account, UserProfile, api } from "@/lib/api";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  account: Account | null;
  accounts: Account[];
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => void;
  updateAccount: (account: Account) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [account, setAccount] = useState<Account | null>(() => {
    const stored = localStorage.getItem("bank_account");
    return stored ? JSON.parse(stored) : null;
  });

  const loadAccounts = useCallback(async () => {
    if (token) {
      try {
        const accs = await api.getAccounts();
        setAccounts(accs);
        if (accs.length > 0) {
          setAccount(accs[0]);
          localStorage.setItem("bank_account", JSON.stringify(accs[0]));
        } else {
          setAccount(null);
          localStorage.removeItem("bank_account");
        }
      } catch (err) {
        console.error("Failed to load accounts", err);
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadAccounts();
    }
  }, [token, loadAccounts]);

  const login = useCallback(async (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAccount(null);
    setAccounts([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("bank_account");
  }, []);

  const updateAccount = useCallback((acc: Account) => {
    setAccount(prev => {
      const updated = prev ? { ...prev, ...acc } : acc;
      localStorage.setItem("bank_account", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, user, account, accounts, login, logout, updateAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
