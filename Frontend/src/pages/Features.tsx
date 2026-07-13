import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Zap, MessageSquare, Shield, Activity, Share2, 
  BarChart3, Sparkles, Instagram, Database, ArrowRight,
  TrendingUp, Users, Clock, Bot
} from "lucide-react";

export default function Features() {
  useSEO({
    title: "Product Features - Instagram Automation",
    description: "Discover DMPilot's AI-powered Instagram DM automation tools. Scale your lead capture, setup triggers, and close sales automatically.",
    keywords: "instagram marketing, automation features, AI chatbot, sales funnel, direct message bot"
  });

  const mainFeatures = [
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "AI Conversation Bot",
      description: "Understand context, intent, and sentiment. Handle complex questions naturally rather than sticking to rigid scripts."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Comment-to-DM Triggers",
      description: "Auto-reply to comments on posts, reels, or live streams and immediately drop a conversion link in their DMs."
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Keyword Smart Matching",
      description: "Define trigger phrases like 'price', 'guide', or 'discount' to activate targeted sales funnels instantly."
    },
    {
      icon: <Database className="h-6 w-6 text-primary" />,
      title: "CRM & Lead Capture",
      description: "Extract Instagram handle, full name, email, and custom fields from conversations and sync them directly to your CRM."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Real-time Analytics",
      description: "Track click-through rates, lead conversion speed, drop-offs, and total sales volume from automated channels."
    },
    {
      icon: <Share2 className="h-6 w-6 text-primary" />,
      title: "Pre-built Integrations",
      description: "Connect seamlessly to Slack, Google Sheets, Zapier, Webhooks, and external REST APIs in single clicks."
    }
  ];

  const automationHighlights = [
    {
      label: "Instant Responses",
      value: "< 1.2 Seconds",
      desc: "Lightning fast processing keeps leads hot."
    },
    {
      label: "Automated Conversions",
      value: "Up to 34%",
      desc: "Average conversion increase on post comments."
    },
    {
      label: "Time Saved Daily",
      value: "3+ Hours",
      desc: "Replaces manual copy-paste messaging tasks."
    }
  ];

  const faqs = [
    {
      q: "Does using DMPilot violate Instagram's terms of service?",
      a: "No. DMPilot uses the official Meta Graph API. All messaging tools, triggers, and accounts operate strictly within Meta's guidelines, keeping your account 100% safe."
    },
    {
      q: "How does the AI understand different comment variations?",
      a: "Our integrated LLM analyzes semantic meaning. Whether a user comments 'send info', 'gimme', or 'GUIDE please', the bot recognizes the trigger and starts the sequence."
    },
    {
      q: "Can I connect multiple Instagram accounts?",
      a: "Yes. Depending on your subscription plan, you can connect multiple business profiles and manage them from a single dashboard."
    },
    {
      q: "Is there a setup guide for the automated sequences?",
      a: "Absolutely. We offer visual templates that let you design conversations in under 2 minutes. No coding experience needed."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="container relative px-4 mx-auto text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 border border-primary/20">
                <Sparkles className="h-3 w-3" /> Core Product Features
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-balance leading-none mb-6">
                Complete Automation Suite for <span className="text-primary">Instagram Growth</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
                Everything you need to turn social interactions into lead lists, booked calls, and checkouts on auto-pilot.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#overview">Overview & Specs</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Preview & Product Overview */}
        <section id="overview" className="py-16 bg-secondary/30 border-y border-border">
          <div className="container px-4 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold tracking-tight">The Modern Control Center for Conversational Sales</h2>
                <p className="text-muted-foreground text-lg">
                  Instantly configure response flows, track campaign effectiveness, and review conversations directly from a clean web application.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Official Meta Partner Integration</h4>
                      <p className="text-sm text-muted-foreground">Authorized platform with full safety clearances. No shadow bans.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Interactive DM Funnel Builder</h4>
                      <p className="text-sm text-muted-foreground">Drag, drop, and link prompts to define conversations and custom links.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative lg:ml-6"
              >
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-3xl" />
                <div className="relative border border-border bg-card rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-500/80" />
                      <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                      <span className="h-3 w-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">dashboard.dmpilot.ai</span>
                  </div>
                  
                  {/* Mock Dashboard Layout */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-secondary p-3 rounded-sm border border-border/50">
                        <span className="text-[10px] text-muted-foreground block">Active Campaigns</span>
                        <span className="text-lg font-bold text-foreground">8</span>
                      </div>
                      <div className="bg-secondary p-3 rounded-sm border border-border/50">
                        <span className="text-[10px] text-muted-foreground block">Total Leads</span>
                        <span className="text-lg font-bold text-primary">1,420</span>
                      </div>
                      <div className="bg-secondary p-3 rounded-sm border border-border/50">
                        <span className="text-[10px] text-muted-foreground block">Conversion %</span>
                        <span className="text-lg font-bold text-foreground">24.5%</span>
                      </div>
                    </div>
                    
                    {/* Mock Campaign Item */}
                    <div className="bg-secondary/40 p-4 rounded-sm border border-border/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-foreground">Reels Guide Campaign</span>
                        <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded font-mono">LIVE</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: "75%" }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Trigger: comment 'GUIDE'</span>
                        <span>750/1000 DMs Sent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Engineered for Creators, Scaleups & Brands</h2>
              <p className="text-muted-foreground">Professional features to support thousands of interactions without dropping a single sale.</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mainFeatures.map((feat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="p-6 rounded-xl border border-border bg-card hover:bg-accent/10 transition-all shadow-sm"
                >
                  <div className="mb-4">{feat.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Performance & Security Stats */}
        <section className="py-16 bg-secondary/20 border-y border-border">
          <div className="container px-4 mx-auto">
            <div className="grid gap-8 sm:grid-cols-3 text-center">
              {automationHighlights.map((hl, idx) => (
                <div key={idx} className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{hl.label}</span>
                  <p className="text-4xl font-bold text-primary">{hl.value}</p>
                  <p className="text-sm text-muted-foreground">{hl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container px-4 mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-12">Loved by High-Growth Creators</h2>
            <div className="grid gap-6 md:grid-cols-2 text-left">
              <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                <p className="text-sm text-muted-foreground italic mb-4">
                  "DMPilot transformed how we launch templates. We commented 'BUILD' and within 48 hours, over 3,000 leads got the signup link automatically. The dashboard is clean, and configuration took us 3 minutes."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold border">JD</div>
                  <div>
                    <h5 className="font-semibold text-sm">Julien Deschenes</h5>
                    <span className="text-xs text-muted-foreground">Digital Products Creator</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                <p className="text-sm text-muted-foreground italic mb-4">
                  "Our agency handles 10+ creator accounts. DMPilot saves us at least 40 hours of manual community management work every single week. Best of all, it's fully compliant with Instagram APIs."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold border">MK</div>
                  <div>
                    <h5 className="font-semibold text-sm">Maya K.</h5>
                    <span className="text-xs text-muted-foreground">Creative Agency Founder</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-secondary/30 border-t border-border">
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

        {/* CTA section */}
        <section className="py-20 relative overflow-hidden bg-primary/5">
          <div className="container relative px-4 mx-auto text-center max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Ready to automate your direct message pipeline?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Get started with DMPilot today. Connect your Instagram profile in 2 clicks and launch your first campaign.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup">Start Automated Campaign</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
