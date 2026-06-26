import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";

const tiers = [
  { name: "Free", price: "$0", desc: "Try it out", features: ["1 connected account", "100 DMs / month", "Basic analytics"], cta: "Start free", variant: "outline" as const },
  { name: "Starter", price: "$29", desc: "For solo creators", features: ["3 accounts", "5,000 DMs / month", "Funnel builder", "CRM (1k leads)"], cta: "Get Starter", variant: "outline" as const },
  { name: "Pro", price: "$79", desc: "For growing brands", features: ["10 accounts", "50,000 DMs / month", "Advanced analytics", "Unlimited CRM", "Priority support"], cta: "Get Pro", variant: "hero" as const, popular: true },
  { name: "Agency", price: "$199", desc: "For teams & agencies", features: ["Unlimited accounts", "Unlimited DMs", "Team seats", "White-label reports", "Dedicated CSM"], cta: "Talk to sales", variant: "outline" as const },
];

type LandingPlanKey = "starter" | "pro" | "agency";

const toUpgradePlanKey = (name: string): LandingPlanKey | null => {
  const n = name.trim().toLowerCase();
  if (n === "starter") return "starter";
  if (n === "pro") return "pro";
  if (n === "agency") return "agency";
  return null;
};

export function Pricing() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-16 sm:py-24 lg:py-28">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Simple, <span className="gradient-text">scale-as-you-grow</span> plans
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">14-day free trial on every paid plan. No credit card required.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((t, i) => {
            const upgradePlan = toUpgradePlanKey(t.name);
            const target = upgradePlan
              ? `/dashboard/settings?upgradePlan=${upgradePlan}`
              : `/signup?plan=${t.name.toLowerCase()}`;

            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn(
                  "relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1",
                  t.popular
                    ? "border-primary/50 bg-background shadow-glow"
                    : "border-border bg-card hover:border-primary/30",
                )}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-semibold tracking-wider uppercase">
                    Most popular
                  </span>
                )}
                <h3 className="font-semibold text-lg">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">{t.price}</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>

                <Button variant={t.variant} className="w-full mt-5" asChild>
                  {accessToken && upgradePlan ? (
                    <a
                      href={target}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(target);
                      }}
                    >
                      {t.cta}
                    </a>
                  ) : (
                    <Link to={target}>{t.cta}</Link>
                  )}
                </Button>

                <ul className="mt-6 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

