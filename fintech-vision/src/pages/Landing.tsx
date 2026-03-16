import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Zap, BarChart3, ArrowRight, CreditCard, Lock, Mail, Phone, MapPin, Menu, X } from "lucide-react";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const features = [
  { icon: Shield, title: "Bank-Grade Security", desc: "Enterprise-level encryption and multi-layer authentication protect every transaction." },
  { icon: Zap, title: "Instant Transfers", desc: "Move money between accounts in real-time with zero processing delays." },
  { icon: BarChart3, title: "Smart Analytics", desc: "Comprehensive reporting and visual insights into your financial health." },
  { icon: CreditCard, title: "Multi-Account Support", desc: "Manage Savings, Checking, and Current accounts from one unified dashboard." },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-navy">
              <span className="text-primary-foreground font-display font-bold text-sm">VB</span>
            </div>
            <span className="font-display text-xl font-bold text-foreground">VaultBank</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/signup"><Button variant="hero" size="sm">Get Started</Button></Link>
          </div>
          <button
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <div className="container mx-auto px-6 py-4 space-y-3">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
                <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className="w-full justify-center">Sign In</Button></Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}><Button variant="hero" className="w-full justify-center">Get Started</Button></Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent mb-6">
                <Lock className="h-3 w-3" /> Banking Transaction Simulator
              </span>
            </motion.div>
            <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Modern Banking,{" "}
              <span className="text-gradient-accent">Simplified</span>
            </motion.h1>
            <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Experience seamless account management, instant fund transfers, and powerful financial analytics — built for the Indian banking ecosystem.
            </motion.p>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="hero" size="lg" className="text-base px-8">
                  Open an Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="hero-outline" size="lg" className="text-base px-8">Sign In to Dashboard</Button>
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent/5 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">A comprehensive suite of banking tools designed for speed, security, and simplicity.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
                className="group rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-all duration-300">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:gradient-accent group-hover:text-accent-foreground transition-all duration-300">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">Built for the Future of Indian Finance</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                VaultBank is a cutting-edge banking transaction simulator that demonstrates real-world financial operations with enterprise-grade architecture, designed for the Indian banking ecosystem.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Powered by Spring Boot 3.5 on the backend and a modern React frontend, it showcases deposits, withdrawals, fund transfers, and comprehensive financial reporting — all in Indian Rupees (₹).
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="rounded-2xl gradient-navy p-8 text-primary-foreground">
              <div className="space-y-6">
                {[
                  { label: "Transactions Processed", value: "10L+" },
                  { label: "Uptime Guarantee", value: "99.9%" },
                  { label: "Response Time", value: "<50ms" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between border-b border-primary-foreground/10 pb-4 last:border-0">
                    <span className="text-sm opacity-80">{s.label}</span>
                    <span className="font-display text-2xl font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Get in Touch</h2>
            <p className="text-muted-foreground">Have questions? Our team is here to help.</p>
          </motion.div>
          <div className="max-w-md mx-auto space-y-4">
            {[
              { icon: Mail, text: "support@vaultbank.in" },
              { icon: Phone, text: "+91 98765 43210" },
              { icon: MapPin, text: "Hyderabad, Telangana, India" },
            ].map((item, i) => (
              <motion.div key={item.text} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-foreground">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
