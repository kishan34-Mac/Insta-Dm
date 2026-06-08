import * as React from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, onMouseMove, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 180, damping: 18, mass: 0.3 });
    const springY = useSpring(y, { stiffness: 180, damping: 18, mass: 0.3 });

    const transform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const dx = px - rect.width / 2;
      const dy = py - rect.height / 2;

      const max = 8;
      const nx = (dx / (rect.width / 2)) * max;
      const ny = (dy / (rect.height / 2)) * max;

      x.set(Math.max(-max, Math.min(max, nx)));
      y.set(Math.max(-max, Math.min(max, ny)));

      onMouseMove?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      x.set(0);
      y.set(0);
      onMouseLeave?.(e);
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ transform }}
        className={cn(
          "card group relative overflow-hidden rounded-[24px] text-card-foreground",
          "bg-white/60 dark:bg-zinc-950/60 backdrop-blur-[20px] supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60",
          "border border-white/50 dark:border-white/10",
          "shadow-[0_4px_20px_rgba(15,23,42,.05),0_1px_3px_rgba(15,23,42,.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,.2)]",
          "transition-transform duration-300 will-change-transform",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring/30",
          "hover:transform hover:-translate-y-[8px] hover:scale-[1.02]",
          "hover:border-primary/50 dark:hover:border-primary/50",
          "hover:shadow-[0_30px_60px_rgba(139,92,246,.15),0_10px_25px_rgba(59,130,246,.10),0_0_40px_rgba(139,92,246,.12)] dark:hover:shadow-[0_30px_60px_rgba(139,92,246,.15),0_10px_25px_rgba(59,130,246,.10),0_0_40px_rgba(139,92,246,.12)]",
          className
        )}
        {...props}
      >
        {/* glow layer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            content: "\"\"",
            position: "absolute",
            inset: "-1px",
            borderRadius: "inherit",
            background: "linear-gradient(135deg, rgba(139,92,246,.4), rgba(59,130,246,.4))",
            filter: "blur(25px)",
          }}
        />

        {/* shine sweep */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div className="absolute -inset-px bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(139,92,246,.28),transparent_45%)]" />
          <div className="absolute -inset-px bg-[radial-gradient(900px_circle_at_80%_110%,rgba(59,130,246,.24),transparent_60%)]" />
          <div className="absolute inset-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" style={{ transform: "translateX(-50%) rotate(8deg)" }} />
        </div>

        {children}
      </motion.div>
    );
  },
);

Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
