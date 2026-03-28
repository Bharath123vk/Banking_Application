import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Globe, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error("Please enter email and password"); return; }
    setLoading(true);
    try {
      const authRes = await api.loginUser({ email: email.trim(), password });
      await login(authRes.token, authRes.user);
      toast.success(`Welcome back, ${authRes.user.name}!`);
      navigate("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Invalid credentials";
      toast.error(errorMessage);
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
          <p className="text-primary-foreground/70 text-lg max-w-sm">Access your accounts, track transactions, and manage your finances with confidence.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground mb-8">Enter your credentials to access the dashboard.</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="e.g. hello@vaultbank.in" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
            </div>
            <Button type="submit" variant="hero" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
