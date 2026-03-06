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
}

export interface Transaction {
  id: number;
  referenceNumber: string; // Matches Java model referenceNumber
  transactionType: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER_IN" | "TRANSFER_OUT"; // Matches Java enum
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  transactionDate: string; // Matches Java model transactionDate
  transactionStatus: "SUCCESS" | "FAILED";
  targetAccountNumber?: string; // Matches Java model field for PhonePe-style transfers
}

export interface SignUpData {
  holderName: string;
  email: string;
  initialBalance: number;
  accountType: "SAVINGS" | "CHECKING" | "CURRENT";
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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  // For standard API calls, we return JSON. 
  // For file downloads, we bypass this and use a direct link in the component.
  return res.json();
}

export const api = {
  // Accounts
  getAccounts: () => request<Account[]>("/accounts"),
  getAccount: (accountNumber: string) => request<Account>(`/accounts/${accountNumber}`),
  createAccount: (data: SignUpData) => request<Account>("/accounts", { method: "POST", body: JSON.stringify(data) }),
  activateAccount: (accountNumber: string) => request<Account>(`/accounts/${accountNumber}/activate`, { method: "PUT" }),
  deactivateAccount: (accountNumber: string) => request<Account>(`/accounts/${accountNumber}/deactivate`, { method: "PUT" }),

  // Transactions
  deposit: (data: DepositData) => request<Transaction>("/transactions/deposit", { method: "POST", body: JSON.stringify(data) }),
  withdraw: (data: WithdrawData) => request<Transaction>("/transactions/withdraw", { method: "POST", body: JSON.stringify(data) }),
  transfer: (data: TransferData) => request<Transaction>("/transactions/transfer", { method: "POST", body: JSON.stringify(data) }),
  
  // Dynamic path for account history
  getTransactions: (accountNumber?: string) => 
    request<Transaction[]>(accountNumber ? `/transactions/account/${accountNumber}` : "/transactions"),

  // Reports - All endpoints now match the @PostMapping in ReportController
  getReports: () => request<string[]>("/reports/list"),
  generateAccountStatement: (accountNumber: string) => 
    request<{message: string, filename: string}>(`/reports/account-statement/${accountNumber}`, { method: "POST" }),
  generateBankSummary: () => 
    request<{message: string, filename: string}>("/reports/bank-summary", { method: "POST" }),
};