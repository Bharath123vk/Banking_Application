import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Briefcase, Edit2, Check, X, Loader2 } from "lucide-react";

export default function Profile() {
  const { account, updateAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State initialized with account data
  const [formData, setFormData] = useState({
    email: account?.email || "",
    phoneNumber: account?.phoneNumber || "",
    address: account?.address || "",
    occupation: account?.occupation || "Student",
  });

  const handleSave = async () => {
    if (!account) return;
    setLoading(true);
    try {
      // Call the API we updated in api.ts
      const updatedAccount = await api.updateProfile(account.accountNumber, formData);
      
      // Update the global state in AuthContext so other pages see the changes
      updateAccount(updatedAccount);
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)) || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!account) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences.</p>
        </div>
        <Button 
          variant={isEditing ? "outline" : "hero"} 
          onClick={() => setIsEditing(!isEditing)}
          disabled={loading}
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
        <div className="md:col-span-1 rounded-xl border border-border bg-card p-6 shadow-card text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{account.holderName}</h2>
          <p className="text-sm text-primary font-mono mb-2">{account.accountNumber}</p>
          <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase tracking-wider">
            {account.accountType} Account
          </div>
        </div>

        {/* Right Card: Detailed Info */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="space-y-6">
            {/* Email Field */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email Address</p>
                {isEditing ? (
                  <Input 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="mt-1" 
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">{account.email || "Not set"}</p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone Number</p>
                {isEditing ? (
                  <Input 
                    value={formData.phoneNumber} 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                    className="mt-1" 
                    placeholder="+91 00000 00000" 
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">{account.phoneNumber || "No phone number added"}</p>
                )}
              </div>
            </div>

            {/* Address Field */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Home Address</p>
                {isEditing ? (
                  <Input 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    className="mt-1" 
                    placeholder="City, State, Country"
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">{account.address || "No address added"}</p>
                )}
              </div>
            </div>

            {/* Employment Type */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Employment Type</p>
                {isEditing ? (
                  <select 
                    title="Employment Type"
                    value={formData.occupation} 
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business">Business</option>
                    <option value="Student">Student</option>
                  </select>
                ) : (
                  <p className="text-sm text-foreground font-medium">{account.occupation || "Not selected"}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-border">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={handleSave} 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <><Check className="mr-2 h-4 w-4" /> Save Changes</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}