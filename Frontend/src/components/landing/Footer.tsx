import { BrandLogo } from "@/components/BrandLogo";

import { motion } from "framer-motion";

import {
  Check,
  Github,
  Heart,
  Instagram,
  Linkedin,
  Shield,
  Sparkles,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <li>
      <Link
        to={href}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {children}
      </Link>
    </li>
  );
};

const SocialLink = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-secondary hover:bg-accent/40 text-muted-foreground transition-colors hover:text-foreground"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
};

export function Footer() {
  const productLinks = [
    ["Features", "/features"],
    ["Pricing", "/pricing"],
    ["Integrations", "/integrations"],
    ["Analytics", "/analytics"],
  ] as const;

  const resourcesLinks = [
    ["How it works", "/how-it-works"],
    ["Documentation", "/docs"],
    ["API Reference", "/api-reference"],
    ["Community", "/community"],
  ] as const;

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="relative px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="container"
        >
            {/* Main grid */}
            <div className="grid gap-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
              {/* Brand */}
              <div className="lg:col-span-1">

                <div className="mt-4">
                  <img src="/assets/athenura-logo.png" alt="DMPilot" className="h-7 w-auto object-contain dark:brightness-0 dark:invert transition-all" />
                </div>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Turn Instagram comments into paying customers automatically.
                </p>

                <div className="mt-4 flex items-center gap-2">

                  <SocialLink href="#" label="X / Twitter">
                    <Twitter className="h-4 w-4" />
                  </SocialLink>
                  <SocialLink href="#" label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </SocialLink>
                  <SocialLink href="#" label="LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </SocialLink>
                  <SocialLink href="#" label="GitHub">
                    <Github className="h-4 w-4" />
                  </SocialLink>
                </div>
              </div>

              {/* Product */}
              <div className="lg:col-span-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Product</h4>
                <ul className="mt-4 space-y-2">

                  {productLinks.map(([label, href]) => (
                    <FooterLink key={label} href={href}>
                      {label}
                    </FooterLink>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div className="lg:col-span-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Resources</h4>
                <ul className="mt-4 space-y-2">

                  {resourcesLinks.map(([label, href]) => (
                    <FooterLink key={label} href={href}>
                      {label}
                    </FooterLink>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div className="lg:col-span-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Company</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link to="/about" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/careers" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
              {/* <div className="flex">
             <p className="mt-0 text-sm text-muted-foreground max-w-xs ml-auto " >
              Turn Instagram comments into paying customers — automatically.
            </p>
              <p className="mt-0 text-sm leading-relaxed text-muted-foreground max-w-xs ml-auto" >
                        Get automation tips, growth strategies, and product updates.
                      </p>
            </div> */}


             {/* trust indicators */}
            {/* <div className="mt-12 rounded-2xl border border-white/10 bg-[rgba(255,255,255,.03)] backdrop-blur-xl p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">


                <div className="flex items-center gap-2 text-xs ">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(16,185,129,.10)] ring-1 ring-[rgba(16,185,129,.22)]">
                    <Check className="h-4 w-4 text-[rgba(134,239,172,.95)]" />
                  </span>
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-xs ">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(59,130,246,.10)] ring-1 ring-[rgba(59,130,246,.22)]">
                    <Shield className="h-4 w-4 text-[rgba(147,197,253,.95)]" />
                  </span>
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2 text-xs ">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(139,92,246,.10)] ring-1 ring-[rgba(139,92,246,.22)]">
                    <Sparkles className="h-4 w-4 text-[rgba(216,180,254,.95)]" />
                  </span>
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2 text-xs ">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(20,184,166,.10)] ring-1 ring-[rgba(20,184,166,.22)]">
                    <Check className="h-4 w-4 text-[rgba(94,234,212,.95)]" />
                  </span>
                  <span>Meta API Connected</span>
                </div>
              </div>
            </div> */}

            {/* divider */}
            <div className="mt-6 h-px w-full bg-border" />


            {/* bottom bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-4 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center justify-between gap-3 text-xs text-muted-foreground w-full"
            >
              <div className="text-center sm:text-left order-1">
                <p>© 2026 DMPilot. All Rights Reserved.</p>
              </div>
              
              <div className="text-center order-2">
                <span className="inline-flex items-center gap-1">
                  Design and Created by{" "}
                  <a
                    href="https://www.athenura.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit Athenura website"
                    className="relative inline-flex items-center gap-0.5 font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:brightness-110 active:brightness-125 transition-all duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded px-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-indigo-500 after:to-blue-500 after:transition-transform after:duration-300 hover:after:scale-x-100"
                  >
                    Athenura
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 inline text-purple-500 select-none">
                      <path d="M15 3h6v6" />
                      <path d="M10 14 21 3" />
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                  </a>
                </span>
              </div>

              <div className="flex justify-center sm:justify-end order-3 gap-4">
                <Link to="/privacy" className="transition-colors hover:text-foreground">
                  Privacy
                </Link>
                <span className="text-muted-foreground/30 select-none">•</span>
                <Link to="/terms" className="transition-colors hover:text-foreground">
                  Terms
                </Link>
                <span className="text-muted-foreground/30 select-none">•</span>
                <Link to="/cookies" className="transition-colors hover:text-foreground">
                  Cookies
                </Link>
              </div>
            </motion.div>

          </motion.div>
        </div>
    </footer>
  );
}
