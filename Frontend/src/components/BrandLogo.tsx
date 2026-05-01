import { cn } from "@/lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  animated?: boolean;
  className?: string;
};

export function BrandLogo({
  compact = false,
  animated = false,
  className,
}: BrandLogoProps) {
  const Icon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm font-semibold",
          animated && "transition-transform duration-300 hover:scale-105",
          className,
        )}
        aria-label="Athenura"
      >
        <Icon />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center shrink-0 h-8 w-auto mr-2",
        animated && "transition-transform duration-300 hover:scale-105",
        className,
      )}
      aria-label="Athenura"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm mr-2.5">
        <Icon />
      </div>
      <span className="font-display text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
        Athenura
      </span>
    </span>
  );
}
