import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Heart, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-[-0.03em] text-balance leading-[1.05]"
          >
            Turn Instagram comments into{" "}
            <span className="text-primary font-medium">paying customers</span>{" "}
            automatically.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance px-2"
          >
            Athenura auto-DMs every comment, captures leads, and converts
            followers with intelligent funnels — all from one beautiful
            dashboard.
          </motion.p>

          {/* Social proof + live stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 sm:mt-10 px-4 sm:px-0"
          >
            <div className="mx-auto max-w-2xl">
              <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⭐⭐⭐⭐⭐</span>
                    <p className="text-sm font-medium text-foreground">
                      Trusted by 12,000+ creators
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs">
                      <p className="text-sm font-semibold text-foreground leading-none">
                        47,281
                      </p>
                      <p className="text-muted-foreground leading-none">
                        DMs Sent Today
                      </p>
                    </div>

                    <div className="hidden sm:block h-10 w-px bg-border" />

                    <div className="text-xs">
                      <p className="text-sm font-semibold text-foreground leading-none">
                        12,142
                      </p>
                      <p className="text-muted-foreground leading-none">
                        Leads Captured
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
            >
              <Button
                variant="hero"
                size="xl"
                asChild
                className="w-full sm:w-auto"
              >
                <Link to="/signup">
                  Start free trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="xl"
                asChild
                className="w-full sm:w-auto"
              >
                <a href="#how">See how it works</a>
              </Button>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            No credit card required · 14-day Pro trial · Cancel anytime
          </motion.p>
        </div>

        {/* Animated UI preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 sm:mt-20 relative max-w-5xl mx-auto"
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

