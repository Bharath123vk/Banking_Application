import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="font-display text-4xl font-bold text-foreground mb-6">Terms of Service</h1>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p><strong>Effective Date:</strong> 1st January 2026</p>
          <p>By using VaultBank, you agree to the following terms. This application is a banking transaction simulator built for educational and demonstration purposes.</p>
          <h2 className="font-display text-xl font-semibold text-foreground mt-8">1. Purpose</h2>
          <p>VaultBank simulates banking operations including account creation, deposits, withdrawals, fund transfers, and reporting. It does not process real money or connect to actual financial institutions.</p>
          <h2 className="font-display text-xl font-semibold text-foreground mt-8">2. User Responsibilities</h2>
          <p>Users must not use this platform for any unlawful purpose. All data entered is for simulation only.</p>
          <h2 className="font-display text-xl font-semibold text-foreground mt-8">3. Limitation of Liability</h2>
          <p>VaultBank and its developers (Infosys Internship Batch 13) are not liable for any loss arising from use of this simulator.</p>
          <h2 className="font-display text-xl font-semibold text-foreground mt-8">4. Governing Law</h2>
          <p>These terms are governed by the laws of India.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
