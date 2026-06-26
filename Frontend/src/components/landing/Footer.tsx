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
      <a
        href={href}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {children}
      </a>
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
    ["Features", "#features"],
    ["Pricing", "#pricing"],
    ["Integrations", "#"],
    ["Analytics", "#"],
  ] as const;

  const resourcesLinks = [
    ["How it works", "#how"],
    ["Documentation", "#"],
    ["API Reference", "#"],
    ["Community", "#"],
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
                  <img src="/assets/athenura-logo.png" alt="Athenura" className="h-7 w-auto object-contain dark:brightness-0 dark:invert transition-all" />
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
                    <a href="#" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      Contact
                    </a>
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
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-muted-foreground">© {2026} Athenura. All rights reserved.</p>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <a href="/privacy" className="transition-colors hover:text-foreground">
                  Privacy
                </a>
                <a href="/terms" className="transition-colors hover:text-foreground">
                  Terms
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Cookies
                </a>
              </div>
            </div>

          </motion.div>
        </div>
    </footer>
  );
}
