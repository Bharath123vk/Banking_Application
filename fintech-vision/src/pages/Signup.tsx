import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api, SignUpData } from "@/lib/api";
import { toast } from "sonner";
import { Globe, ArrowLeft } from "lucide-react";

export default function Signup() {
  const [form, setForm] = useState<SignUpData>({ holderName: "", email: "", initialBalance: 0, accountType: "SAVINGS" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.holderName.trim() || !form.email.trim()) { toast.error("Please fill all fields"); return; }
    if (form.initialBalance < 0) { toast.error("Initial balance cannot be negative"); return; }
    setLoading(true);
    try {
      const account = await api.createAccount(form);
      login(account);
      toast.success(`Account ${account.accountNumber} created! Welcome, ${account.holderName}!`);
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 animate-pulse-glow" />
        <div className="relative text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20 mx-auto mb-6">
            <Globe className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary-foreground mb-4">VaultBank</h1>
          <p className="text-primary-foreground/70 text-lg max-w-sm">Start your financial journey with a secure, modern banking experience.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Create Account</h2>
          <p className="text-muted-foreground mb-8">Open a new bank account in seconds.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="holderName">Full Name</Label>
              <Input id="holderName" placeholder="Rahul Sharma" value={form.holderName} onChange={(e) => setForm({ ...form, holderName: e.target.value })} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="rahul@example.in" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Initial Balance (₹)</Label>
              <Input id="balance" type="number" min="0" step="0.01" placeholder="1000.00" value={form.initialBalance} onChange={(e) => setForm({ ...form, initialBalance: parseFloat(e.target.value) || 0 })} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select value={form.accountType} onValueChange={(v) => setForm({ ...form, accountType: v as SignUpData['accountType'] })}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                  <SelectItem value="CHECKING">Checking</SelectItem>
                  <SelectItem value="CURRENT">Current</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="hero" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
