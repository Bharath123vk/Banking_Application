import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, History, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const typeIcon = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("deposit") || t.includes("transfer_in")) 
    return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
  if (t.includes("withdraw") || t.includes("transfer_out")) 
    return <ArrowUpRight className="h-4 w-4 text-destructive" />;
  return <ArrowLeftRight className="h-4 w-4 text-primary" />;
};

export default function TransactionHistory() {
  const { account } = useAuth();
  const [search, setSearch] = useState("");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", account?.accountNumber],
    queryFn: () => api.getTransactions(account?.accountNumber || ""),
    enabled: !!account,
  });

  const filtered = transactions.filter((t) =>
    [
      t.referenceNumber, 
      t.transactionType, 
      t.description, 
      t.targetAccountNumber,
      t.amount?.toString()
    ].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground text-sm">Review your full digital audit trail and payment history.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Account Holder</p>
          <p className="text-sm font-medium">{account?.holderName}</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search by ID, type, or amount..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-10 h-11 shadow-sm focus:ring-2 focus:ring-primary/20" 
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-4 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Reference</th>
                <th className="px-4 py-4 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Type & Details</th>
                <th className="px-4 py-4 text-right font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Amount</th>
                <th className="px-4 py-4 text-right font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Running Balance</th>
                <th className="px-4 py-4 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Description</th>
                <th className="px-4 py-4 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                      <p className="text-sm animate-pulse">Retrieving secure transaction data...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-24 text-center">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-muted-foreground"
                    >
                      <div className="bg-muted rounded-full p-4 mb-4">
                        <History className="h-10 w-10 opacity-40 text-primary" />
                      </div>
                      <p className="text-lg font-semibold text-foreground">No Transactions Found</p>
                      <p className="text-sm max-w-[250px] mx-auto mt-1">
                        {search ? `We couldn't find any results for "${search}"` : "You haven't made any transactions yet. Your activity will appear here."}
                      </p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                filtered.map((t, i) => (
                  <motion.tr 
                    key={t.id} 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      {t.referenceNumber}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                          {typeIcon(t.transactionType)} 
                          <span className="capitalize">{t.transactionType.replace('_', ' ').toLowerCase()}</span>
                        </span>
                        {t.targetAccountNumber && t.transactionType.includes("TRANSFER") && (
                          <span className="text-[10px] text-muted-foreground/80 ml-5 font-medium">
                            {t.transactionType === "TRANSFER_OUT" ? "TO: " : "FROM: "}
                            {t.targetAccountNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-right font-bold text-base ${
                      t.transactionType.includes("OUT") || t.transactionType === "WITHDRAWAL" 
                        ? "text-destructive" : "text-green-600"
                    }`}>
                      {t.transactionType.includes("OUT") || t.transactionType === "WITHDRAWAL" ? "-" : "+"}
                      {formatINR(t.amount)}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-foreground">
                      {formatINR(t.balanceAfter)}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground max-w-[150px] truncate italic text-xs">
                      {t.description || "System Transaction"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground text-xs whitespace-nowrap">
                      {t.transactionDate ? new Date(t.transactionDate).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      }) : "—"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}