import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";

const tiers = [
  { name: "Free", price: "$0", desc: "Try it out", features: ["1 connected account", "100 DMs / month", "Basic analytics"], cta: "Start free", variant: "outline" as const },
  { name: "Starter", price: "$29", desc: "For solo creators", features: ["3 accounts", "5,000 DMs / month", "Funnel builder", "CRM (1k leads)"], cta: "Get Starter", variant: "outline" as const },
  { name: "Pro", price: "$79", desc: "For growing brands", features: ["10 accounts", "50,000 DMs / month", "Advanced analytics", "Unlimited CRM", "Priority support"], cta: "Get Pro", variant: "hero" as const, popular: true },
  { name: "Agency", price: "$199", desc: "For teams & agencies", features: ["Unlimited accounts", "Unlimited DMs", "Team seats", "White-label reports", "Dedicated CSM"], cta: "Talk to sales", variant: "outline" as const },
];

export function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTierCta = (planName: string) => {
    const planKey = planName.toLowerCase();

    // Map landing tiers to backend plan keys used in Settings.tsx
    // Free/Start free should not trigger Razorpay. Keep signup flow for now.
    if (planKey === "free") {
      return null;
    }

    if (planKey === "agency") {
      // message says “sales” but project tier is “Agency”
      return "agency";
    }

    if (planKey === "starter" || planKey === "pro") return planKey;

    return null;
  };

  const onCtaClick = (tierName: string) => {
    const selected = handleTierCta(tierName);

    // If logged in and a paid tier selected -> redirect to dashboard settings to auto-upgrade
    if (user && selected) {
      navigate(`/dashboard/settings?upgradePlan=${selected}`);
      return;
    }

    // Otherwise keep existing signup flow (logged out or Free)
    const signupPlan = tierName.toLowerCase();
    navigate(`/signup?plan=${signupPlan}`);
  };

  return (
    <section id="pricing" className="py-16 sm:py-24 lg:py-28">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.025em] text-balance">
            Simple, <span className="text-primary font-medium">scale-as-you-grow</span> plans
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">14-day free trial on every paid plan. No credit card required.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={cn(
                "relative rounded-lg p-6 border transition-shadow duration-200 shadow-sm hover:shadow-md",
                t.popular
                  ? "border-[#202020] bg-[#1c1c1c] text-white dark:border-primary/30"
                  : "border-border bg-card text-foreground"
              )}
            >
              {t.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-sm bg-primary text-primary-foreground border border-primary/20 text-[10px] font-semibold tracking-wider uppercase">
                  Most popular
                </span>
              )}
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <p className={cn("text-sm mt-1", t.popular ? "text-muted-foreground" : "text-muted-foreground")}>{t.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">{t.price}</span>
                <span className={cn("text-sm", t.popular ? "text-muted-foreground" : "text-muted-foreground")}>/mo</span>
              </div>
              <Button
                variant={t.popular ? "hero" : "outline"}
                className="w-full mt-5"
                onClick={() => onCtaClick(t.name)}
              >
                {t.cta}
              </Button>
              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className={t.popular ? "text-white/80" : "text-muted-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
