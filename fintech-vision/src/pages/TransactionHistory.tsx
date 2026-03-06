import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";

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

  // Updated filter to use the new field names from the backend
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
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Transaction History</h1>
        <p className="text-muted-foreground">Complete audit trail of all transactions.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search by ID, type, or account..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-10 h-11" 
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reference</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type & Details</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Balance</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading transactions...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No transactions found.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{t.referenceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          {typeIcon(t.transactionType)} 
                          <span className="capitalize">{t.transactionType.replace('_', ' ').toLowerCase()}</span>
                        </span>
                        {/* Show Target Account for Transfers */}
                        {t.targetAccountNumber && t.transactionType.includes("TRANSFER") && (
                          <span className="text-[10px] text-muted-foreground ml-5">
                            {t.transactionType === "TRANSFER_OUT" ? "To: " : "From: "}
                            {t.targetAccountNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${
                      t.transactionType.includes("OUT") || t.transactionType === "WITHDRAWAL" 
                        ? "text-destructive" : "text-green-600"
                    }`}>
                      {t.transactionType.includes("OUT") || t.transactionType === "WITHDRAWAL" ? "-" : "+"}
                      {formatINR(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      <div className="text-[10px]">After: {formatINR(t.balanceAfter)}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[150px] truncate">
                      {t.description || "Bank Transaction"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {t.transactionDate ? new Date(t.transactionDate).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      }) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}