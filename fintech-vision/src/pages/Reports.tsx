import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Download, RefreshCw, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Reports() {
  const { account, token } = useAuth();
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
    
    if (!filename.includes(account.accountNumber) && !filename.startsWith("Bank_Summary")) {
      toast.error("Unauthorized access to this report.");
      return;
    }

    const url = `http://localhost:8081/api/reports/${filename}?owner=${account.accountNumber}&token=${token}`;
    
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Reporting Hub</h1>
          <p className="text-muted-foreground text-sm">Generate and archive secure financial statements.</p>
        </div>
        <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-2 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-[11px] font-medium text-primary uppercase tracking-wider leading-none">
            End-to-End Encrypted Reports
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-3xl">
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">Account Statement</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Includes all transactions, running balances, and reference IDs for the current fiscal period.
          </p>
          <Button 
            className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all" 
            onClick={handleGenerateStatement} 
            disabled={generating}
          >
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate PDF Statement
          </Button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <RefreshCw className="h-5 w-5 text-accent" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">Bank Summary</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            A comprehensive overview of total bank liquidity, holdings, and account distribution metrics.
          </p>
          <Button 
            variant="outline" 
            className="w-full h-11 border-accent/20 hover:bg-accent/5 active:scale-95 transition-all" 
            onClick={handleGenerateSummary} 
            disabled={generating}
          >
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Generate PDF Summary
          </Button>
        </motion.div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-4">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">Your Secure Archive</h3>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
              {filteredReports.length} Files
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 hover:bg-background" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
        
        <div className="p-2">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center py-16 text-muted-foreground"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary/40 mb-2" />
                <p className="text-sm font-medium">Scanning secure directory...</p>
              </motion.div>
            ) : filteredReports.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center py-20 text-muted-foreground"
              >
                <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 opacity-20" />
                </div>
                <p className="text-base font-semibold text-foreground">Archive is Empty</p>
                <p className="text-xs text-center max-w-[200px] mt-1">
                  Once generated, your PDF statements will be securely stored here for 30 days.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                className="space-y-1"
              >
                {[...filteredReports].reverse().map((report, i) => (
                  <motion.div 
                    key={report} 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.04 }}
                    className="group flex items-center justify-between rounded-lg border border-transparent hover:border-border hover:bg-muted/30 p-3 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors shadow-sm">
                        <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground truncate max-w-[200px] md:max-w-md">
                          {report}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">PDF Document</span>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                          <span className="text-[10px] text-green-600 font-bold uppercase">Ready for Download</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-4 border-primary/20 hover:bg-primary hover:text-white transition-all active:scale-95"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Important Notice</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Generated reports are unique to your account number and session. For security reasons, please do not share downloaded files containing sensitive balance information.
          </p>
        </div>
      </div>
    </div>
  );
}