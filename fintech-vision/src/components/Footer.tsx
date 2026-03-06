import { Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="gradient-navy py-12">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-4 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                <Globe className="h-4 w-4 text-accent" />
              </div>
              <span className="font-display text-lg font-bold text-primary-foreground">VaultBank</span>
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              A modern banking transaction simulator built with enterprise-grade architecture for the Indian financial ecosystem.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Features</a></li>
              <li><a href="#about" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="#contact" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-3 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:support@vaultbank.in" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Report an Issue</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-3 text-sm">Contact</h4>
            <ul className="space-y-2">
              <li className="text-sm text-primary-foreground/60">support@vaultbank.in</li>
              <li className="text-sm text-primary-foreground/60">+91 98765 43210</li>
              <li className="text-sm text-primary-foreground/60">Bengaluru, Karnataka, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">© 2026 VaultBank. All rights reserved.</p>
          <p className="text-sm font-medium text-accent/80">Developed by Infosys Internship Batch 13</p>
        </div>
      </div>
    </footer>
  );
}
