import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { 
  Building, Compass, Eye, Heart, Code, Users, 
  Sparkles, ShieldAlert, ArrowRight, CheckCircle
} from "lucide-react";

export default function About() {
  useSEO({
    title: "About DMPilot - Our Mission & Team Story",
    description: "Learn about DMPilot's backstory, core cultural values, server architecture technology stack, core platform metrics, and product vision.",
    keywords: "instagram company, messaging software history, developer culture, product values"
  });

  const statistics = [
    { label: "Direct messages automated", value: "50M+" },
    { label: "Active global creators & brands", value: "12,000+" },
    { label: "Successful lead conversions", value: "1.2M+" },
    { label: "Average server response delay", value: "< 1.2s" }
  ];

  const values = [
    {
      icon: <Compass className="h-6 w-6 text-primary" />,
      title: "Simplicity First",
      desc: "We build intuitive software. Setting up complex messaging funnels should take minutes, not days."
    },
    {
      icon: <Eye className="h-6 w-6 text-primary" />,
      title: "Full Transparency",
      desc: "No hidden charges, accurate delivery reports, and absolute clarity on Meta API compliance protocols."
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: "Creator Empowerment",
      desc: "Our platform exists to help independent builders, small businesses, and agencies automate tasks to grow."
    }
  ];

  const timeline = [
    { year: "2024", title: "DMPilot Founded", desc: "First release of static keyword responders for comment replies." },
    { year: "2025", title: "Official Meta API Partnership", desc: "Linked platforms directly to Meta Graph APIs, scaling client accounts safely." },
    { year: "2026", title: "AI Conversations & CRM Release", desc: "Integrated LLM context parsers and automatic CRM spreadsheet triggers." }
  ];

  const techStack = [
    { name: "Frontend Client", tech: "Vite, React.js, TailwindCSS, TypeScript" },
    { name: "Backend Engines", tech: "Node.js, Express, Socket.io, BullMQ" },
    { name: "Databases & Caches", tech: "PostgreSQL, Prisma ORM, Redis Key-Value Store" },
    { name: "Security & AI APIs", tech: "OpenAI API, AES-256 database column encryption" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* About Hero */}
        <section className="relative overflow-hidden py-16 text-center">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="container relative px-4 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 border border-primary/20">
                <Building className="h-3.5 w-3.5" /> Our Backstory
              </span>
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6">
                Scaling Conversations, <span className="text-primary">Automating Sales</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                DMPilot builds modern software to turn Instagram interactions into paying clients automatically.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story, Mission & Vision */}
        <section className="py-12 border-t border-border">
          <div className="container px-4 mx-auto max-w-4xl">
            <div className="grid gap-12 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" /> Our Core Mission
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Creators spend hours copy-pasting direct messages to leads commenting on posts. We built DMPilot to automate this pipeline. Our mission is to provide high-speed, secure API conduits that save time and optimize conversation conversion rates.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" /> Our Product Vision
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We look ahead to multi-channel chat architectures. By combining secure webhooks with smart AI LLM systems, we aim to deliver natural chatbot conversations that feel real and drive sales across every platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-secondary/20 border-y border-border">
          <div className="container px-4 mx-auto">
            <div className="grid gap-8 grid-cols-2 lg:grid-cols-4 text-center">
              {statistics.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-3xl sm:text-4xl font-extrabold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Our Operating Values</h2>
              <p className="text-muted-foreground text-sm">The cultural values that direct our developers and support teams daily.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {values.map((val, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
                  <div className="mb-4 p-2 bg-secondary rounded-lg w-fit border border-border">{val.icon}</div>
                  <h4 className="font-bold text-base mb-2">{val.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Company History Timeline */}
        <section className="py-20 bg-secondary/35 border-y border-border">
          <div className="container px-4 mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Our Timeline</h2>
            <div className="relative border-l border-border pl-6 space-y-10">
              {timeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  {/* Timeline bullet node */}
                  <span className="absolute -left-[31px] top-1 h-4.5 w-4.5 rounded-full border-2 border-primary bg-card" />
                  <span className="text-xs font-mono font-bold text-primary">{item.year}</span>
                  <h4 className="font-bold text-sm mt-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack Grid */}
        <section className="py-20">
          <div className="container px-4 mx-auto max-w-4xl">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Technical Specifications</h2>
              <p className="text-muted-foreground text-sm">We construct resilient cloud services using standard, state-of-the-art framework languages.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {techStack.map((stack, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-card flex gap-4 shadow-sm">
                  <div className="p-2 bg-secondary rounded-lg border h-fit text-primary shrink-0"><Code className="h-5 w-5" /></div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs sm:text-sm text-foreground">{stack.name}</h5>
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">{stack.tech}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-secondary/15 border-t border-border">
          <div className="container px-4 mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">The Builders Behind DMPilot</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mb-12 max-w-md mx-auto">
              We are a remote team of software engineers, creators, and UI designers.
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="h-16 w-16 bg-secondary rounded-full mx-auto border flex items-center justify-center font-bold text-lg text-primary">KK</div>
                <div>
                  <h5 className="font-bold text-sm">Kishan K.</h5>
                  <span className="text-[10px] text-muted-foreground">Founder & Lead Architect</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="h-16 w-16 bg-secondary rounded-full mx-auto border flex items-center justify-center font-bold text-lg text-primary">SL</div>
                <div>
                  <h5 className="font-bold text-sm">Sarah L.</h5>
                  <span className="text-[10px] text-muted-foreground">Senior AI Engineer</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="h-16 w-16 bg-secondary rounded-full mx-auto border flex items-center justify-center font-bold text-lg text-primary">DM</div>
                <div>
                  <h5 className="font-bold text-sm">David M.</h5>
                  <span className="text-[10px] text-muted-foreground">Full Stack Developer</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ultimate CTA */}
        <section className="py-16 bg-primary/5 border-t border-border text-center">
          <div className="container px-4 mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Start Automating Your Instagram Inbox</h2>
            <p className="text-muted-foreground mb-8">Launch keyword campaigns, capture emails, and link checkouts in under 2 minutes.</p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
