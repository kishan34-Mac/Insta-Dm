import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      <div className="absolute inset-0 mesh-bg pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-10 flex items-center justify-between gap-4 p-4 sm:p-6">
        <Link to="/" aria-label="Athenura home">
          <BrandLogo animated className="h-9 w-[132px] sm:h-11 sm:w-[158px]" />
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative flex w-full items-center justify-center p-4 pt-24 sm:p-6 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-5 sm:p-8">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {footer}
          </p>
        </motion.div>
      </main>
    </div>
  );
}
