import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Search, ShieldAlert, Sparkles, MessageCircle, 
  Send, Slack, Disc, HelpCircle, GitPullRequest, Code,
  Laptop, CheckCircle2, ArrowRight
} from "lucide-react";

export default function Integrations() {
  useSEO({
    title: "App Integrations - Connect Your Stack",
    description: "Sync DMPilot with the applications you already use. Connect Instagram, Slack, OpenAI, Zapier, Google Sheets, or custom webhook handlers.",
    keywords: "instagram integration, webhook, api connect, slack sync, openai chatbot, zapier"
  });

  const categories = ["All", "Messaging", "AI & CRM", "Productivity & Developer"];
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectedState, setConnectedState] = useState<Record<string, boolean>>({
    "Instagram": true
  });

  const integrations = [
    {
      name: "Instagram",
      category: "Messaging",
      description: "Automate Direct Messages, track stories, and replies directly via Meta APIs.",
      icon: <MessageCircle className="h-8 w-8 text-[#e1306c]" />,
      status: "Active",
      setupTime: "1 min",
      docsLink: "/docs#setup-instagram"
    },
    {
      name: "Facebook Messenger",
      category: "Messaging",
      description: "Auto-respond to client messages on your business page automatically.",
      icon: <MessageCircle className="h-8 w-8 text-[#0084ff]" />,
      status: "Active",
      setupTime: "2 mins",
      docsLink: "/docs#setup-facebook"
    },
    {
      name: "WhatsApp Business",
      category: "Messaging",
      description: "Trigger automations on WhatsApp groups or individual customer numbers.",
      icon: <MessageCircle className="h-8 w-8 text-[#25d366]" />,
      status: "Beta",
      setupTime: "3 mins",
      docsLink: "/docs#setup-whatsapp"
    },
    {
      name: "Telegram Bot API",
      category: "Messaging",
      description: "Sync commands and forwards between Telegram channels and leads.",
      icon: <Send className="h-8 w-8 text-[#0088cc]" />,
      status: "Active",
      setupTime: "2 mins",
      docsLink: "/docs#setup-telegram"
    },
    {
      name: "Slack",
      category: "Productivity & Developer",
      description: "Deliver instant channel updates when a new high-value lead is captured.",
      icon: <Slack className="h-8 w-8 text-[#4a154b]" />,
      status: "Active",
      setupTime: "2 mins",
      docsLink: "/docs#setup-slack"
    },
    {
      name: "Discord Webhooks",
      category: "Productivity & Developer",
      description: "Pipe conversions and event metrics directly into your server logs.",
      icon: <Disc className="h-8 w-8 text-[#5865f2]" />,
      status: "Active",
      setupTime: "1 min",
      docsLink: "/docs#setup-discord"
    },
    {
      name: "Google Sheets",
      category: "Productivity & Developer",
      description: "Add rows containing lead names, emails, and profiles automatically.",
      icon: <Laptop className="h-8 w-8 text-[#0f9d58]" />,
      status: "Active",
      setupTime: "2 mins",
      docsLink: "/docs#setup-google"
    },
    {
      name: "OpenAI GPT-4",
      category: "AI & CRM",
      description: "Use custom context instructions to generate smart, natural chat replies.",
      icon: <Sparkles className="h-8 w-8 text-[#10a37f]" />,
      status: "Active",
      setupTime: "5 mins",
      docsLink: "/docs#setup-openai"
    },
    {
      name: "Zapier",
      category: "AI & CRM",
      description: "Connect DMPilot triggers to 5,000+ software services on Zapier.",
      icon: <GitPullRequest className="h-8 w-8 text-[#ff4f00]" />,
      status: "Active",
      setupTime: "2 mins",
      docsLink: "/docs#setup-zapier"
    },
    {
      name: "Custom Webhooks",
      category: "AI & CRM",
      description: "Dispatch raw JSON payloads to external URLs immediately upon triggers.",
      icon: <HelpCircle className="h-8 w-8 text-primary" />,
      status: "Active",
      setupTime: "2 mins",
      docsLink: "/docs#setup-webhooks"
    },
    {
      name: "REST API",
      category: "AI & CRM",
      description: "Direct server interface to update campaigns or queries programmatically.",
      icon: <Code className="h-8 w-8 text-[#f89820]" />,
      status: "Developer API",
      setupTime: "5 mins",
      docsLink: "/api-reference"
    }
  ];

  const handleConnect = (name: string) => {
    if (connectedState[name]) {
      setConnectedState(prev => ({ ...prev, [name]: false }));
      toast.error(`Disconnected ${name} integration`);
    } else {
      setConnectedState(prev => ({ ...prev, [name]: true }));
      toast.success(`Successfully connected to ${name}!`);
    }
  };

  const filteredIntegrations = integrations.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Integrations Header */}
        <section className="relative overflow-hidden py-16 text-center">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="container relative px-4 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 border border-primary/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> Extend Your Workflows
              </span>
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6">
                Connected <span className="text-primary">Ecosystem</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Seamlessly pipe Instagram interactions into your database, CRM, notifications, and AI pipelines.
              </p>
            </motion.div>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mt-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm border-border bg-card"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    activeCategory === cat
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-secondary hover:bg-accent/40 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Grid */}
        <section className="py-12">
          <div className="container px-4 mx-auto">
            {filteredIntegrations.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg border-border max-w-md mx-auto">
                <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium text-sm">No integrations match your selection.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredIntegrations.map((item, idx) => {
                  const isConnected = connectedState[item.name] || false;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: idx * 0.03 }}
                      className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between hover:shadow-sm transition-all"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="p-2.5 rounded-lg border border-border bg-secondary">
                            {item.icon}
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              item.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : item.status === "Beta"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                            }`}>
                              {item.status}
                            </span>
                            <span className="block text-[10px] text-muted-foreground mt-1">Setup: {item.setupTime}</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-foreground flex items-center gap-1.5">
                            {item.name}
                            {isConnected && (
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Connected" />
                            )}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/50">
                        <Button
                          variant={isConnected ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleConnect(item.name)}
                          className="flex-1 text-xs"
                        >
                          {isConnected ? "Disconnect" : "Connect"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="flex-1 text-xs"
                        >
                          <Link to={item.docsLink}>View Docs</Link>
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Integration Request CTA */}
        <section className="py-20 relative bg-secondary/15 border-t border-border">
          <div className="container px-4 mx-auto text-center max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Using an internal CRM or custom software?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
              We offer customizable webhooks, a robust Developer API, and full Node/Python SDK integration guides.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/api-reference">Explore API Reference <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
