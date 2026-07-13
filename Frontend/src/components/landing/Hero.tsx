import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Heart, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-24 sm:pb-24 sm:pt-32 bg-background flex flex-col justify-center border-b border-border/40">
      {/* Clean Technical Greyscale Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.15] pointer-events-none" />

      <div className="container relative max-w-[1280px]">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Supabaze Neutral Pill Tag */}
          {/* <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border border-border/80 bg-secondary/50 text-muted-foreground shadow-sm hover:border-border transition-colors cursor-default scale-95 sm:scale-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/80">✨ AI-Powered Instagram Automation</span>
          </motion.div> */}

          {/* DMPilot Centerpiece Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mt-8 mb-6 inline-block select-none"
          >
            <span className="font-display text-7xl sm:text-8xl md:text-9xl font-semibold tracking-[-0.04em] block leading-none text-foreground">
              DM<span className="text-primary font-semibold">Pilot</span>
            </span>
          </motion.div>

          {/* Headline with negative display tracking */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-balance leading-[1.1] text-foreground font-sans"
          >
            Automate Every Instagram Conversation.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed"
          >
            Turn comments into customers with AI-powered direct messages, intelligent lead capture, and real-time campaign automation.
          </motion.p>

          {/* CTA Buttons - Signature 6px button radius */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto px-4 sm:px-0"
          >
            <Button
              variant="hero"
              size="lg"
              asChild
              className="w-full sm:w-auto rounded-sm"
            >
              <Link to="/signup">
                Start Free 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full sm:w-auto rounded-sm border border-border hover:bg-secondary transition-colors text-foreground"
            >
              <Link to="/contact">Book a Demo</Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-1">
              <span className="text-primary text-xs">★</span>
              <span className="text-primary text-xs">★</span>
              <span className="text-primary text-xs">★</span>
              <span className="text-primary text-xs">★</span>
              <span className="text-primary text-xs">★</span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase font-mono">
              Trusted by creators, agencies & businesses
            </p>
          </motion.div>

        </div>

        {/* Animated UI preview in Level 2 elevation card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-16 sm:mt-24 max-w-5xl mx-auto"
        >
          <div className="relative border border-border bg-card p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
            <DmFlowPreview />
          </div>
        </motion.div>

      </div>
    </section>
  );
}

function DmFlowPreview() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {/* Comment */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="rounded-lg bg-card border border-border p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <MessageCircle className="h-3.5 w-3.5" /> New comment
        </div>
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-secondary shrink-0 flex items-center justify-center border border-border text-xs font-semibold">
            SC
          </div>
          <div>
            <p className="text-sm font-medium">@sarah.codes</p>
            <p className="text-sm text-muted-foreground mt-1">
              "Send me the{" "}
              <span className="text-primary font-semibold">guide</span> please!{" "}
              🙏"
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> 24
              </span>
              <span>2s ago</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trigger */}
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        className="rounded-lg border border-border bg-card p-4 relative overflow-hidden shadow-sm"
      >
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-primary mb-3">
            <Zap className="h-3.5 w-3.5" /> Keyword matched · "guide"
          </div>
          <div className="space-y-2">
            <div className="rounded-sm bg-secondary px-3 py-2 text-xs border border-border/55">
              <span className="text-muted-foreground">If comment contains</span>{" "}
              <span className="font-semibold">"guide"</span>
            </div>
            <div className="rounded-sm bg-secondary px-3 py-2 text-xs border border-border/55">
              <span className="text-muted-foreground">Then send</span>{" "}
              <span className="font-semibold">DM Sequence #3</span>
            </div>
            <div className="rounded-sm bg-primary/10 px-3 py-2 text-xs flex items-center gap-2 border border-primary/20 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="font-semibold">
                Triggering now…
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* DM */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="rounded-lg bg-card border border-border p-4 shadow-sm sm:col-span-2 lg:col-span-1"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <MessageCircle className="h-3.5 w-3.5" /> DM delivered · auto
        </div>
        <div className="space-y-2">
          <div className="ml-auto max-w-[85%] rounded-sm bg-primary text-primary-foreground text-sm px-3 py-2 border border-primary/20 font-medium">
            Hey Sarah! 👋 Here's your free guide ↓
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.5,
              duration: 0.4,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="ml-auto max-w-[85%] rounded-sm bg-primary text-primary-foreground text-sm px-3 py-2 border border-primary/20 font-medium"
          >
            👉 reel2rev.com/guide
          </motion.div>
          <div className="text-[10px] text-muted-foreground text-right pt-1">
            Lead captured · added to CRM
          </div>
        </div>
      </motion.div>
    </div>
  );
}

