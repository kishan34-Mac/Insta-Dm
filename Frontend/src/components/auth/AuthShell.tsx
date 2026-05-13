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
    <div className="min-h-[100dvh] flex flex-col relative overflow-x-hidden bg-background">
      <div className="absolute inset-0 mesh-bg pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-10 flex items-center justify-between gap-4 p-4 sm:p-6 w-full max-w-7xl mx-auto">
        <Link to="/" aria-label="Athenura home">
          <BrandLogo animated className="h-8 w-auto sm:h-10" />
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content properly centered vertically and horizontally */}
      <main className="relative flex flex-1 w-full items-center justify-center p-4 pt-20 sm:p-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[340px] sm:max-w-md mx-auto"
        >
          <div className="glass-card p-5 sm:p-8 w-full shadow-lg rounded-2xl border border-border/50">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">{subtitle}</p>
            <div className="mt-5 sm:mt-6 w-full">{children}</div>
          </div>
          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6 w-full">
            {footer}
          </p>
        </motion.div>
      </main>
    </div>
  );
}
