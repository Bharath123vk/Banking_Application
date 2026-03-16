import { useState } from "react";
import { Bell, AlertTriangle, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatINR } from "@/lib/format";

const LOW_BALANCE_THRESHOLD = 500;

// Updated to use transactionType and lowercase comparison
const typeIcon = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("deposit") || t.includes("transfer_in")) 
    return <ArrowDownLeft className="h-3.5 w-3.5 text-accent" />;
  if (t.includes("withdraw") || t.includes("transfer_out")) 
    return <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />;
  return <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />;
};

export function NotificationsDropdown() {
  const { account } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: transactions = [] } = useQuery({
    queryKey: ["notifications-txns", account?.accountNumber],
    queryFn: () => api.getTransactions(account?.accountNumber),
    enabled: !!account,
    refetchInterval: 15000,
  });

  // FIXED: Changed 'timestamp' to 'transactionDate'
  const recentTxns = transactions
    .slice()
    .sort((a, b) => 
      new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    )
    .slice(0, 5);

  const isLowBalance = account && account.balance < LOW_BALANCE_THRESHOLD;
  const alertCount = (isLowBalance ? 1 : 0) + recentTxns.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <h4 className="font-display font-semibold text-foreground text-sm">Notifications</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLowBalance && (
            <div className="flex items-start gap-3 border-b border-border/50 bg-warning/5 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Low Balance Alert</p>
                <p className="text-xs text-muted-foreground">
                  Balance is {formatINR(account.balance)} — below {formatINR(LOW_BALANCE_THRESHOLD)} threshold.
                </p>
              </div>
            </div>
          )}
          {recentTxns.length === 0 && !isLowBalance ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            recentTxns.map((t) => (
              <div key={t.id} className="flex items-start gap-3 border-b border-border/50 px-4 py-3 hover:bg-muted/30 transition-colors">
                {/* FIXED: Changed 't.type' to 't.transactionType' */}
                <div className="mt-0.5 shrink-0">{typeIcon(t.transactionType)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground capitalize">
                    {t.transactionType.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatINR(t.amount)} · {t.description || "No description"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {/* FIXED: Changed 't.timestamp' to 't.transactionDate' */}
                    {t.transactionDate ? new Date(t.transactionDate).toLocaleString("en-IN") : "—"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}