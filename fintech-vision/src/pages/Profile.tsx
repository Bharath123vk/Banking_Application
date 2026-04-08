import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Briefcase, Edit2, Check, X, Loader2, Copy, ShieldCheck, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Profile() {
  const { user, account, accounts, updateAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccForm, setNewAccForm] = useState({ accountType: "SAVINGS", initialBalance: 0 });

  const [formData, setFormData] = useState({
    email: account?.email || "",
    phoneNumber: account?.phoneNumber || "",
    address: account?.address || "",
    occupation: account?.occupation || "Student",
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Account number copied to clipboard!");
  };

  const handleSave = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const updatedAccount = await api.updateProfile(account.accountNumber, formData);
      updateAccount(updatedAccount);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)) || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getOccupationStyles = (occ: string) => {
    switch (occ?.toLowerCase()) {
      case 'salaried': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'business': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'student': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleCreateAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.createAccount({
        holderName: user.name,
        email: user.email,
        initialBalance: newAccForm.initialBalance,
        accountType: newAccForm.accountType as "SAVINGS" | "CHECKING" | "CURRENT"
      });
      toast.success("New account created successfully! Please refresh.");
      setShowNewAccount(false);
      window.location.reload(); // Simple refresh to load new accounts
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (!account || !user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your personal information and account settings.</p>
        </div>
        <Button 
          variant={isEditing ? "outline" : "hero"} 
          onClick={() => setIsEditing(!isEditing)}
          disabled={loading}
          className="transition-all duration-300 active:scale-95"
        >
          {isEditing ? (
            <><X className="mr-2 h-4 w-4" /> Cancel</>
          ) : (
            <><Edit2 className="mr-2 h-4 w-4" /> Edit Profile</>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Card: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card text-center overflow-hidden relative">
            <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-background shadow-inner">
              <User className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground truncate">{account.holderName}</h2>
            
            <div 
              className="flex items-center justify-center gap-2 group cursor-pointer mb-3"
              onClick={() => copyToClipboard(account.accountNumber)}
            >
              <p className="text-sm text-primary font-mono font-medium">{account.accountNumber}</p>
              <Copy className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>

            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getOccupationStyles(account.occupation || 'Student')}`}>
              {account.occupation || "Student"}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-primary/5 p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <p className="text-[11px] text-primary/80 leading-relaxed">
              Your profile data is encrypted and used only for account verification and personalized banking services.
            </p>
          </div>
        </div>

        {/* Right Card: Detailed Info */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card relative">
          <div className="space-y-6">
            {/* Email Field */}
            <div className="flex items-center gap-4 group">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email Address</p>
                {isEditing ? (
                  <Input 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="mt-1 focus:ring-2 focus:ring-primary/20" 
                  />
                ) : (
                  <p className="text-sm text-foreground font-semibold">{account.email || "Not set"}</p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div className="flex items-center gap-4 group">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Phone className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone Number</p>
                {isEditing ? (
                  <Input 
                    value={formData.phoneNumber} 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                    className="mt-1 focus:ring-2 focus:ring-primary/20" 
                    placeholder="+91 00000 00000" 
                  />
                ) : (
                  <p className="text-sm text-foreground font-semibold">{account.phoneNumber || "No phone number added"}</p>
                )}
              </div>
            </div>

            {/* Address Field */}
            <div className="flex items-center gap-4 group">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Home Address</p>
                {isEditing ? (
                  <Input 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    className="mt-1 focus:ring-2 focus:ring-primary/20" 
                    placeholder="City, State, Country"
                  />
                ) : (
                  <p className="text-sm text-foreground font-semibold">{account.address || "No address added"}</p>
                )}
              </div>
            </div>

            {/* Employment Type */}
            <div className="flex items-center gap-4 group">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Briefcase className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Employment Type</p>
                {isEditing ? (
                  <select 
                    title="Employment Type"
                    value={formData.occupation} 
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business">Business</option>
                    <option value="Student">Student</option>
                  </select>
                ) : (
                  <p className="text-sm text-foreground font-semibold">{account.occupation || "Not selected"}</p>
                )}
              </div>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-border overflow-hidden"
                >
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                    onClick={handleSave} 
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <><Check className="mr-2 h-4 w-4" /> Save Changes</>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">My Bank Accounts</h3>
            <p className="text-sm text-muted-foreground">You currently have {accounts.length} linked account(s).</p>
          </div>
          <Button onClick={() => setShowNewAccount(!showNewAccount)} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Open New Account
          </Button>
        </div>

        <AnimatePresence>
          {showNewAccount && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 border rounded-lg bg-muted/30 overflow-hidden">
              <h4 className="font-semibold mb-3">Create a New Account</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Account Type</span>
                  <Select value={newAccForm.accountType} onValueChange={(v) => setNewAccForm({ ...newAccForm, accountType: v })}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                      <SelectItem value="CHECKING">Checking</SelectItem>
                      <SelectItem value="CURRENT">Current</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Initial Deposit (₹)</span>
                  <Input type="number" min="0" value={newAccForm.initialBalance} onChange={(e) => setNewAccForm({ ...newAccForm, initialBalance: parseFloat(e.target.value) || 0 })} className="bg-background" />
                </div>
              </div>
              <Button onClick={handleCreateAccount} disabled={loading} className="mt-4">
                {loading ? "Processing..." : "Confirm & Open"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {accounts.map(acc => (
            <div key={acc.accountNumber} className={`p-4 rounded-xl border ${acc.accountNumber === account.accountNumber ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{acc.accountType}</span>
                {acc.accountNumber === account.accountNumber && (
                  <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">ACTIVE VIEW</span>
                )}
              </div>
              <p className="font-mono text-sm font-medium mb-1">{acc.accountNumber}</p>
              <p className="font-display text-lg font-bold">₹{acc.balance.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}