import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type BrandLogoProps = {
  compact?: boolean;
  animated?: boolean;
  className?: string;
  to?: string;
};

export function BrandLogo({
  compact = false,
  animated = false,
  className,
  to,
}: BrandLogoProps) {
  const Icon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const icon = <Icon />;

  if (compact) {
    const content = (
      <span
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm font-semibold",
          "leading-none",
          animated && "transition-transform duration-300 hover:scale-105",
          className,
        )}
        aria-label="Athenura"
      >
        {icon}
      </span>
    );

    if (to) {
      return (
        <Link to={to} aria-label="Athenura" className="inline-flex">
          {content}
        </Link>
      );
    }

    return content;
  }

  const content = (
    <span
      className={cn(
        "inline-flex items-center shrink-0 h-8 w-auto mr-2 min-w-0",
        animated && "transition-transform duration-300 hover:scale-105",
        className,
      )}
      aria-label="Athenura"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm mr-2.5">
        {icon}
      </div>
      <span className="font-display text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
         <img src="/assets/athenura-logo.png" alt="brandlogo" className="h-8 w-auto max-w-full object-contain" />
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} aria-label="Athenura" className="inline-flex">
        {content}
      </Link>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center shrink-0 h-8 w-auto mr-2 min-w-0",
        animated && "transition-transform duration-300 hover:scale-105",
        className,
      )}
      aria-label="Athenura"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm mr-2.5">
        <Icon />
      </div>
      <span className="font-display text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 min-w-0">
        <img src="/assets/athenura-logo.png" alt="brandlogo" className="h-8 w-auto max-w-full object-contain" />
      </span>
    </span>
  );
}
