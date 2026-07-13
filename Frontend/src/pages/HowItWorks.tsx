import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Instagram, ClipboardList, Search, MessageCircle, 
  Database, BarChart3, HelpCircle, ArrowRight, ArrowDown,
  Lock, Sparkles, CheckCircle
} from "lucide-react";

export default function HowItWorks() {
  useSEO({
    title: "How It Works - Setup & Automation Guide",
    description: "Learn how DMPilot automatically captures leads and converts Instagram followers in 6 steps: connect profile, configure triggers, process keywords, auto DM, capture data, and update analytics.",
    keywords: "setup instagram bot, comment responder guide, lead funnel instructions, chat automation how to"
  });

  const steps = [
    {
      step: "01",
      icon: <Instagram className="h-6 w-6 text-primary" />,
      title: "Connect Account",
      description: "Securely link your Instagram Business Account using official Facebook login scopes. Setup completes in 2 clicks with 100% compliance.",
      badge: "Meta API Authorized"
    },
    {
      step: "02",
      icon: <ClipboardList className="h-6 w-6 text-primary" />,
      title: "Create Campaign",
      description: "Design conversational replies, select visual assets, and designate specific triggers like comments, posts, stories, or keywords.",
      badge: "Visual Template Editor"
    },
    {
      step: "03",
      icon: <Search className="h-6 w-6 text-primary" />,
      title: "AI Detects Keywords",
      description: "Our high-speed webhook listener parses user comments instantly. Our AI models evaluate variations and meaning to trigger appropriate replies.",
      badge: "Real-time Webhooks"
    },
    {
      step: "04",
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      title: "Automatic DM Sent",
      description: "The system delivers the customized direct message sequence containing links, documents, or promo codes in under 2 seconds.",
      badge: "Instant Delivery"
    },
    {
      step: "05",
      icon: <Database className="h-6 w-6 text-primary" />,
      title: "Lead Stored",
      description: "User details (handle, full name, custom input parameters, and timestamps) are saved in your dashboard CRM or synced to Google Sheets.",
      badge: "CRM Auto-Sync"
    },
    {
      step: "06",
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Analytics Updated",
      description: "Conversion metrics, delivered volumes, click rates, and funnel efficiency details update on your metrics charts in real-time.",
      badge: "Live Metrics"
    }
  ];

  const faqs = [
    {
      q: "Do I need coding skills to construct campaigns?",
      a: "No coding needed. Our builder lets you set up triggers, replies, and link connections using a simple text and choice visual interface."
    },
    {
      q: "Does my device need to be active to trigger responses?",
      a: "No. DMPilot runs on high-reliability cloud servers connected directly to Meta webhooks. Your campaigns operate 24/7, even when you are offline."
    },
    {
      q: "Can I filter comments for specific spam keywords?",
      a: "Yes, you can configure exclusions and safety parameters. Any offensive, spam, or competitive comments are automatically filtered out."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Timeline Header */}
        <section className="relative overflow-hidden py-16 text-center">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="container relative px-4 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 border border-primary/20">
                <Sparkles className="h-3 w-3" /> 6-Step Workflow
              </span>
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6">
                How DMPilot <span className="text-primary">Automates Sales</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                From comment detection to lead CRM updates, understand the exact sequence our engine executes to scale your business.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Timeline Steps Block */}
        <section className="py-12 relative">
          <div className="container px-4 mx-auto max-w-4xl relative">
            {/* Center Line for Desktop Timeline */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-border hidden md:block" />

            <div className="space-y-16">
              {steps.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div key={idx} className={`relative flex flex-col md:flex-row items-center justify-between ${isEven ? "" : "md:flex-row-reverse"}`}>
                    
                    {/* Circle Node on Timeline */}
                    <div className="absolute left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-card border-2 border-primary flex items-center justify-center font-bold text-xs text-primary z-20 hidden md:flex">
                      {idx + 1}
                    </div>

                    {/* Timeline Page Left/Right Blocks */}
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.55 }}
                      className="w-full md:w-[45%] bg-card border border-border p-6 rounded-xl shadow-sm relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-lg border bg-secondary">
                          {item.icon}
                        </div>
                        <span className="text-4xl font-extrabold text-secondary-foreground/20 font-mono">{item.step}</span>
                      </div>

                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                        {item.badge}
                      </span>

                      <h3 className="text-xl font-bold mt-3 mb-2">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </motion.div>

                    {/* Spacer block for flex alignment */}
                    <div className="w-full md:w-[45%] hidden md:block" />

                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Security & Reliability Section */}
        <section className="py-20 bg-secondary/20 border-y border-border">
          <div className="container px-4 mx-auto max-w-4xl">
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <div>
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 mb-4">
                  <Lock className="h-3 w-3" /> Security First Design
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Meta API compliant. No account bans.</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  DMPilot operations rely exclusively on official Meta Graph API protocols. We do not require your Instagram login passwords or use unauthorized background browser scrapers. Your account remains 100% secure.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" /> Official Meta Partnership Protocols
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" /> HTTPS Encryption for All Database Tables
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" /> Complete GDPR Data Privacy Controls
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-2xl" />
                <div className="relative border border-border bg-card p-6 rounded-xl shadow-md text-center space-y-4">
                  <Lock className="h-10 w-10 text-primary mx-auto" />
                  <h4 className="font-semibold">Encryption Shield Active</h4>
                  <p className="text-xs text-muted-foreground">All OAuth access tokens and client details are stored using high-grade AES-256 database encryption columns.</p>
                  <div className="bg-secondary px-3 py-2 rounded border font-mono text-[10px] text-left text-muted-foreground truncate">
                    AES_256::ENC_TOKEN_ID: 98a3b8cd2c...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20">
          <div className="container px-4 mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-10">Process FAQs</h2>
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
        <section className="py-16 bg-primary/5 border-t border-border text-center">
          <div className="container px-4 mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Automate Your First Campaign In Minutes</h2>
            <p className="text-muted-foreground mb-8">Connect your account, write a response message, and test the comment trigger on your next post.</p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">Start Setup Flow <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
