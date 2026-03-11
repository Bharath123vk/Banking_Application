import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Download, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Reports() {
  const { account } = useAuth();
  const [generating, setGenerating] = useState(false);

  const { data: reports = [], refetch, isLoading } = useQuery({
    queryKey: ["reports", account?.accountNumber],
    queryFn: () => api.getReports(account?.accountNumber),
    enabled: !!account,
  });

  const filteredReports = reports.filter(filename => 
    filename.includes(account?.accountNumber || "EMPTY") || 
    filename.startsWith("Bank_Summary")
  );

  const handleGenerateStatement = async () => {
    if (!account) return;
    setGenerating(true);
    try {
      await api.generateAccountStatement(account.accountNumber);
      toast.success("Account statement PDF generated!");
      refetch();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate statement";
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      await api.generateBankSummary();
      toast.success("Bank summary PDF generated!");
      refetch();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate summary";
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (filename: string) => {
    if (!account) return;
    
    // Frontend Security Guard
    if (!filename.includes(account.accountNumber) && !filename.startsWith("Bank_Summary")) {
      toast.error("Unauthorized access to this report.");
      return;
    }

    // UPDATED: Passing 'owner' to match the new Backend Security logic in ReportController
    const url = `http://localhost:8081/api/reports/${filename}?owner=${account.accountNumber}`;
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.info(`Downloading ${filename}...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Reporting Hub</h1>
        <p className="text-muted-foreground">Generate and download your financial reports in PDF format.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">Account Statement</h3>
          <p className="text-sm text-muted-foreground mb-4">Generate a professional PDF statement of your transaction history.</p>
          <Button 
            className="w-full h-11 bg-primary hover:bg-primary/90" 
            onClick={handleGenerateStatement} 
            disabled={generating}
          >
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate PDF Statement
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">Bank Summary</h3>
          <p className="text-sm text-muted-foreground mb-4">Generate a full management summary of all bank holdings.</p>
          <Button 
            variant="outline" 
            className="w-full h-11" 
            onClick={handleGenerateSummary} 
            disabled={generating}
          >
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate PDF Summary
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-display font-semibold text-foreground">Your PDF Reports</h3>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh List
          </Button>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Loading your reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-center">No reports found for your account.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...filteredReports].reverse().map((report, i) => (
                <motion.div 
                  key={report} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-foreground">{report}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">PDF Document</span>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-9 px-3"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}