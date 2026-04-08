const BASE_URL = "http://localhost:8081/api";

export interface Account {
  id: number;
  accountNumber: string;
  holderName: string;
  email: string;
  balance: number;
  accountType: "SAVINGS" | "CHECKING" | "CURRENT";
  active: boolean; 
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
  // NEW PROFILE FIELDS
  phoneNumber?: string;
  address?: string;
  occupation?: string;
  profileAvatar?: string;
}

export interface Transaction {
  id: number;
  referenceNumber: string;
  transactionType: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER_IN" | "TRANSFER_OUT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  transactionDate: string;
  transactionStatus: "SUCCESS" | "FAILED";
  targetAccountNumber?: string;
}

export interface SignUpData {
  holderName: string;
  email: string;
  initialBalance: number;
  accountType: "SAVINGS" | "CHECKING" | "CURRENT";
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface DepositData {
  accountNumber: string;
  amount: number;
}

export interface WithdrawData {
  accountNumber: string;
  amount: number;
}

export interface TransferData {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  description: string;
}

// UPDATED: Included all the new profile fields
export interface UpdateProfileData {
  holderName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  occupation?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  registerUser: (data: RegisterRequest) => request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  loginUser: (data: LoginRequest) => request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  // Accounts
  getAccounts: () => request<Account[]>("/accounts"),
  getAccount: (accountNumber: string) => request<Account>(`/accounts/${accountNumber}`),
  createAccount: (data: SignUpData) => request<Account>("/accounts", { method: "POST", body: JSON.stringify(data) }),
  activateAccount: (accountNumber: string) => request<Account>(`/accounts/${accountNumber}/activate`, { method: "PUT" }),
  deactivateAccount: (accountNumber: string) => request<Account>(`/accounts/${accountNumber}/deactivate`, { method: "PUT" }),
  
  // Profile Update
  updateProfile: (accountNumber: string, data: UpdateProfileData) => 
    request<Account>(`/accounts/${accountNumber}/profile`, { 
      method: "PUT", 
      body: JSON.stringify(data) 
    }),

  // Transactions
  deposit: (data: DepositData) => request<Transaction>("/transactions/deposit", { method: "POST", body: JSON.stringify(data) }),
  withdraw: (data: WithdrawData) => request<Transaction>("/transactions/withdraw", { method: "POST", body: JSON.stringify(data) }),
  transfer: (data: TransferData) => request<Transaction>("/transactions/transfer", { method: "POST", body: JSON.stringify(data) }),
  
  getTransactions: (accountNumber?: string) => 
    request<Transaction[]>(accountNumber ? `/transactions/account/${accountNumber}` : "/transactions"),

  // Reports
 // Inside api object in api.ts
getReports: (accountNumber?: string) => 
  request<string[]>(`/reports/list${accountNumber ? `?accountNumber=${accountNumber}` : ''}`),
  generateAccountStatement: (accountNumber: string) => 
    request<{message: string, filename: string}>(`/reports/account-statement/${accountNumber}`, { method: "POST" }),
  generateBankSummary: () => 
    request<{message: string, filename: string}>("/reports/bank-summary", { method: "POST" }),
};