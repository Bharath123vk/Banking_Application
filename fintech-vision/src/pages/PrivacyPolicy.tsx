import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="font-display text-4xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p><strong>Effective Date:</strong> 1st January 2026</p>
          <p>VaultBank ("we", "us") is a banking transaction simulator developed for educational purposes by Infosys Internship Batch 13. This policy outlines how we handle data within the application.</p>
          <h2 className="font-display text-xl font-semibold text-foreground mt-8">1. Information We Collect</h2>
          <p>We collect simulated banking information including holder name, email address, account type, and transaction records. No real financial data is processed.</p>
          <h2 className="font-display text-xl font-semibold text-foreground mt-8">2. How We Use Information</h2>
          <p>All data is used solely for demonstrating banking operations such as deposits, withdrawals, fund transfers, and reporting within this simulator.</p>
          <h2 className="font-display text-xl font-semibold text-foreground mt-8">3. Data Storage</h2>
          <p>Data is stored in the backend database and session storage. No data is shared with third parties.</p>
          <h2 className="font-display text-xl font-semibold text-foreground mt-8">4. Contact</h2>
          <p>For questions, contact us at <strong>support@vaultbank.in</strong>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
