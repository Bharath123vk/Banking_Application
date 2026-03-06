import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";

export default function Payments() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "deposit";
  const { account, updateAccount } = useAuth();
  const [loading, setLoading] = useState(false);

  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [transferDest, setTransferDest] = useState("");
  const [transferAmt, setTransferAmt] = useState("");
  const [transferDesc, setTransferDesc] = useState("");

  const refreshAccount = async () => {
    if (!account) return;
    try {
      const updated = await api.getAccount(account.accountNumber);
      updateAccount(updated);
    } catch {
      // Silently ignore errors during account refresh
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmt);
    if (!amount || amount <= 0) { toast.error("Enter a valid positive amount"); return; }
    setLoading(true);
    try {
      await api.deposit({ accountNumber: account!.accountNumber, amount });
      toast.success(`${formatINR(amount)} deposited successfully!`);
      setDepositAmt("");
      await refreshAccount();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "An error occurred"); } finally { setLoading(false); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmt);
    if (!amount || amount <= 0) { toast.error("Enter a valid positive amount"); return; }
    setLoading(true);
    try {
      await api.withdraw({ accountNumber: account!.accountNumber, amount });
      toast.success(`${formatINR(amount)} withdrawn successfully!`);
      setWithdrawAmt("");
      await refreshAccount();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "An error occurred"); } finally { setLoading(false); }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmt);
    if (!amount || amount <= 0) { toast.error("Enter a valid positive amount"); return; }
    if (!transferDest.trim()) { toast.error("Enter destination account"); return; }
    setLoading(true);
    try {
      await api.transfer({ sourceAccountNumber: account!.accountNumber, destinationAccountNumber: transferDest.trim(), amount, description: transferDesc.trim() || "Fund Transfer" });
      toast.success(`${formatINR(amount)} transferred successfully!`);
      setTransferDest(""); setTransferAmt(""); setTransferDesc("");
      await refreshAccount();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "An error occurred"); } finally { setLoading(false); }
  };

  if (!account) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground">Deposit, withdraw, or transfer funds.</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="deposit" className="gap-2"><ArrowDownLeft className="h-4 w-4" /> Deposit</TabsTrigger>
          <TabsTrigger value="withdraw" className="gap-2"><ArrowUpRight className="h-4 w-4" /> Withdraw</TabsTrigger>
          <TabsTrigger value="transfer" className="gap-2"><ArrowLeftRight className="h-4 w-4" /> Transfer</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <div className="max-w-md rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Deposit Funds</h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-2">
                <Label>To Account</Label>
                <Input value={account.accountNumber} disabled className="h-12 font-mono bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositAmt">Amount (₹)</Label>
                <Input id="depositAmt" type="number" min="0.01" step="0.01" placeholder="0.00" value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)} className="h-12 text-lg" />
              </div>
              <Button type="submit" variant="success" className="w-full h-12" disabled={loading}>
                {loading ? "Processing..." : "Deposit"}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="withdraw">
          <div className="max-w-md rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Withdraw Funds</h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label>From Account</Label>
                <Input value={account.accountNumber} disabled className="h-12 font-mono bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawAmt">Amount (₹)</Label>
                <Input id="withdrawAmt" type="number" min="0.01" step="0.01" placeholder="0.00" value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value)} className="h-12 text-lg" />
              </div>
              <Button type="submit" variant="destructive" className="w-full h-12" disabled={loading}>
                {loading ? "Processing..." : "Withdraw"}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="transfer">
          <div className="max-w-lg rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Fund Transfer</h3>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label>Source Account</Label>
                <Input value={account.accountNumber} disabled className="h-12 font-mono bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferDest">Destination Account</Label>
                <Input id="transferDest" placeholder="ACC00000002" value={transferDest} onChange={(e) => setTransferDest(e.target.value)} className="h-12 font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferAmt">Amount (₹)</Label>
                <Input id="transferAmt" type="number" min="0.01" step="0.01" placeholder="0.00" value={transferAmt} onChange={(e) => setTransferAmt(e.target.value)} className="h-12 text-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferDesc">Description</Label>
                <Input id="transferDesc" placeholder="Payment for..." value={transferDesc} onChange={(e) => setTransferDesc(e.target.value)} className="h-12" />
              </div>
              <Button type="submit" variant="hero" className="w-full h-12" disabled={loading}>
                {loading ? "Processing..." : "Transfer Funds"}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
