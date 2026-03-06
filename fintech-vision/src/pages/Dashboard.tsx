import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { Wallet, CreditCard, TrendingUp, AlertTriangle, RefreshCw, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const LOW_BALANCE_THRESHOLD = 500;

export default function Dashboard() {
  const { account, updateAccount } = useAuth();

  const { refetch, isLoading } = useQuery({
    queryKey: ["account", account?.accountNumber],
    queryFn: async () => {
      if (!account) return null;
      const updated = await api.getAccount(account.accountNumber);
      updateAccount(updated);
      return updated;
    },
    enabled: !!account,
    refetchInterval: 10000,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions-chart", account?.accountNumber],
    queryFn: () => api.getTransactions(account?.accountNumber || ""),
    enabled: !!account,
  });

  if (!account) return null;

  const isLowBalance = account.balance < LOW_BALANCE_THRESHOLD;
  const isAccountActive = account.active; // Using 'active' boolean from api.ts

  if (isLowBalance) {
    console.warn(`[VaultBank Balance Alert] Account ${account.accountNumber} balance is ₹${account.balance.toFixed(2)}, below threshold ₹${LOW_BALANCE_THRESHOLD.toFixed(2)}.`);
  }

  const handleToggleStatus = async () => {
    try {
      const updated = isAccountActive
        ? await api.deactivateAccount(account.accountNumber)
        : await api.activateAccount(account.accountNumber);
      updateAccount(updated);
      toast.success(`Account ${updated.active ? "activated" : "deactivated"} successfully`);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to update account status");
    }
  };

  const balanceTrend = transactions.length > 0
    ? transactions
        .slice()
        .sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime())
        .map((t) => ({
          date: new Date(t.transactionDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          balance: t.balanceAfter,
          type: t.transactionType,
        }))
    : generateMockTrend(account.balance);

  const typeCounts = transactions.reduce<Record<string, number>>((acc, t) => {
    const type = t.transactionType || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeCounts).length > 0
    ? Object.entries(typeCounts).map(([name, count]) => ({ name, count }))
    : [{ name: "Deposit", count: 0 }, { name: "Withdraw", count: 0 }, { name: "Transfer", count: 0 }];

  const cards = [
    { label: "Account Number", value: account.accountNumber, icon: CreditCard, accent: false },
    { label: "Current Balance", value: formatINR(account.balance), icon: Wallet, accent: true },
    { label: "Account Type", value: account.accountType, icon: TrendingUp, accent: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome, {account.holderName}</h1>
          <p className="text-muted-foreground">Here's your financial overview.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); toast.info("Refreshing..."); }} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {isLowBalance && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-foreground">Low Balance Alert</p>
            <p className="text-sm text-muted-foreground">Your balance is below {formatINR(LOW_BALANCE_THRESHOLD)}. Consider making a deposit.</p>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`rounded-xl border p-6 shadow-card ${card.accent ? "bg-slate-900 text-white border-transparent" : "bg-card border-border"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm ${card.accent ? "text-slate-300" : "text-muted-foreground"}`}>{card.label}</span>
              <card.icon className={`h-5 w-5 ${card.accent ? "text-slate-500" : "text-muted-foreground/50"}`} />
            </div>
            <p className={`font-display text-2xl font-bold ${card.accent ? "text-white" : "text-foreground"}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Balance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                <Tooltip
                  contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}
                  formatter={(value: number) => [formatINR(value), "Balance"]}
                />
                <Area type="monotone" dataKey="balance" stroke="#16a34a" strokeWidth={2.5} fill="url(#balanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Transaction Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="count" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Account Details</h3>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isAccountActive 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isAccountActive ? "bg-green-500" : "bg-red-500"}`} />
              {isAccountActive ? "Active" : "Deactivated"}
            </span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Email", value: account.email },
              { label: "Created", value: account.createdAt ? new Date(account.createdAt).toLocaleDateString("en-IN") : "N/A" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
          <Button
            variant={isAccountActive ? "destructive" : "default"}
            size="sm"
            className="w-full mt-4"
            onClick={handleToggleStatus}
          >
            <Power className="mr-2 h-4 w-4" />
            {isAccountActive ? "Deactivate Account" : "Activate Account"}
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Deposit", href: "/payments?tab=deposit" },
              { label: "Withdraw", href: "/payments?tab=withdraw" },
              { label: "Transfer", href: "/payments?tab=transfer" },
              { label: "View History", href: "/history" },
            ].map((action) => (
              <a key={action.label} href={action.href}
                className="flex items-center justify-center rounded-lg border border-border bg-muted/50 p-3 text-sm font-medium text-foreground hover:bg-slate-100 transition-all">
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function generateMockTrend(currentBalance: number) {
  const data: { date: string; balance: number }[] = [];
  let balance = currentBalance * 0.7;
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    balance += (Math.random() - 0.3) * (currentBalance * 0.08);
    balance = Math.max(0, balance);
    data.push({
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      balance: Math.round(balance * 100) / 100,
    });
  }
  data[data.length - 1].balance = currentBalance;
  return data;
}