import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, HelpCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function Pricing() {
  useSEO({
    title: "Pricing Plans - Flexible Subscriptions",
    description: "Choose the perfect automation plan for your Instagram page. Start free and upgrade to unlock AI keyword processing, CRM flows, and infinite campaigns.",
    keywords: "instagram bot pricing, social media subscription, automation costs, marketing tools"
  });

  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      priceMonthly: 0,
      priceYearly: 0,
      description: "Try it out",
      features: [
        "1 connected account",
        "100 DMs / month",
        "Basic analytics"
      ],
      cta: "Start free",
      popular: false,
      variant: "outline" as const
    },
    {
      name: "Starter",
      priceMonthly: 29,
      priceYearly: 23,
      description: "For solo creators",
      features: [
        "3 accounts",
        "5,000 DMs / month",
        "Funnel builder",
        "CRM (1k leads)"
      ],
      cta: "Get Starter",
      popular: false,
      variant: "outline" as const
    },
    {
      name: "Pro",
      priceMonthly: 79,
      priceYearly: 63,
      description: "For growing brands",
      features: [
        "10 accounts",
        "50,000 DMs / month",
        "Advanced analytics",
        "Unlimited CRM",
        "Priority support"
      ],
      cta: "Get Pro",
      popular: true,
      variant: "hero" as const
    },
    {
      name: "Agency",
      priceMonthly: 199,
      priceYearly: 159,
      description: "For teams & agencies",
      features: [
        "Unlimited accounts",
        "Unlimited DMs",
        "Team seats",
        "White-label reports",
        "Dedicated CSM"
      ],
      cta: "Talk to sales",
      popular: false,
      variant: "outline" as const
    }
  ];

  const comparisons = [
    { feature: "Automated DMs / mo", free: "100", starter: "5,000", pro: "50,000", agency: "Unlimited" },
    { feature: "Connected Accounts", free: "1", starter: "3", pro: "10", agency: "Unlimited" },
    { feature: "AI Conversation Bot", free: "❌", starter: "❌", pro: "✅", agency: "✅" },
    { feature: "CRM Integrations", free: "❌", starter: "1k leads", pro: "Unlimited", agency: "Custom API" },
    { feature: "Analytics Retention", free: "7 Days", starter: "30 Days", pro: "Unlimited", agency: "Unlimited" },
    { feature: "Support Tier", free: "Community", starter: "Email (24h)", pro: "Priority Chat", agency: "Dedicated CSM" }
  ];

  const faqs = [
    {
      q: "Can I cancel or change my plan anytime?",
      a: "Yes, you can cancel, upgrade, or downgrade your plan at any point. If you cancel, your features remain active until the end of your billing cycle."
    },
    {
      q: "Is there a free trial for the paid plans?",
      a: "Yes, both the Starter and Professional plans come with a 14-day free trial. No credit card is required to set up the trial."
    },
    {
      q: "What happens if I exceed my DM limits?",
      a: "We will notify you when you reach 80% and 100% of your limit. If you go over, you can trigger a one-time package add-on or upgrade to keep campaigns running without interruption."
    },
    {
      q: "Are yearly payments discounted?",
      a: "Yes! By selecting yearly billing, you save over 20% on your plan, which is equivalent to getting nearly three months completely free."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Pricing Header */}
        <section className="relative overflow-hidden py-16 text-center">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="container relative px-4 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 border border-primary/20">
                <ShieldCheck className="h-3.5 w-3.5" /> Compliant & Secure Meta Payments
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight mb-6">
                Flexible Pricing for <span className="text-primary">Every Scale</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10">
                Pick a plan to automate your Instagram pipeline. No setup fees, cancel anytime.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-3">
                <span className={`text-sm font-medium ${billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
                  Billed Monthly
                </span>
                <button
                  onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
                  className="relative w-12 h-6 rounded-full bg-secondary border border-border p-0.5 transition-colors focus:outline-none"
                  aria-label="Toggle billing billingPeriod"
                >
                  <motion.div
                    layout
                    className="w-4.5 h-4.5 rounded-full bg-primary"
                    animate={{ x: billingPeriod === "monthly" ? 0 : 22 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-medium ${billingPeriod === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
                    Billed Yearly
                  </span>
                  <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Save 20%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="py-12">
          <div className="container px-4 mx-auto">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 items-stretch">
              {plans.map((plan, idx) => {
                const price = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceYearly;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className={`relative p-6 rounded-lg border flex flex-col justify-between shadow-md transition-all ${
                      plan.popular ? "bg-[#1c1c1c] text-white border-transparent scale-[1.03] z-10" : "bg-card text-foreground border-border hover:border-border/80"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Most Popular
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className={`text-xs mt-1 min-h-[32px] ${plan.popular ? "text-zinc-400" : "text-muted-foreground"}`}>{plan.description}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold">${price}</span>
                        <span className={`text-sm ${plan.popular ? "text-zinc-400" : "text-muted-foreground"}`}>/ month</span>
                      </div>

                      <div className={`h-px my-4 ${plan.popular ? "bg-zinc-800" : "bg-border"}`} />

                      <ul className="space-y-2.5">
                        {plan.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className={plan.popular ? "text-zinc-300" : "text-muted-foreground"}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`mt-8 pt-4 border-t ${plan.popular ? "border-zinc-800" : "border-border/50"}`}>
                      <Button
                        variant={plan.popular ? "hero" : "outline"}
                        className="w-full text-xs font-semibold rounded-sm"
                        asChild
                      >
                        {plan.name === "Agency" ? (
                          <Link to="/contact">Contact Sales</Link>
                        ) : (
                          <Link to="/signup">{plan.cta}</Link>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="py-20 bg-secondary/20 border-y border-border">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight text-center mb-12">Detailed Feature Comparison</h2>
            
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-secondary/50 font-semibold">
                    <th className="p-4">Feature</th>
                    <th className="p-4">Free</th>
                    <th className="p-4">Starter</th>
                    <th className="p-4 text-primary">Pro</th>
                    <th className="p-4">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted-foreground">
                  {comparisons.map((row, idx) => (
                    <tr key={idx} className="hover:bg-accent/5">
                      <td className="p-4 font-medium text-foreground">{row.feature}</td>
                      <td className="p-4">{row.free}</td>
                      <td className="p-4">{row.starter}</td>
                      <td className="p-4 text-foreground font-medium">{row.pro}</td>
                      <td className="p-4">{row.agency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section className="py-20">
          <div className="container px-4 mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left text-base font-semibold">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Ultimate CTA */}
        <section className="py-16 bg-primary/5 border-t border-border">
          <div className="container px-4 mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Start Growing Your Business Today</h2>
            <p className="text-muted-foreground mb-8">No commitment, 14 days trial. Get started now and set up automated comments to DM sequences in minutes.</p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
