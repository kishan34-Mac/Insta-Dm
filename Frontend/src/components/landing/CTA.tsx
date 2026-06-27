import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="md:py-16 sm:py-24 lg:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-primary/30 p-6 sm:p-10 md:p-16 text-center bg-background"
        >
          {/* premium floating glows */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-purple-500/15 blur-3xl opacity-70 animate-floatGlow" />
          <div className="absolute top-10 right-[-120px] w-[320px] h-[320px] rounded-full bg-blue-500/10 blur-3xl opacity-70 animate-floatGlow [animation-delay:1.4s]" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance max-w-2xl mx-auto">
              Stop losing leads in your <span className="gradient-text">comment section</span>.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Join 12,000+ creators who turned engagement into revenue. Start in minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">Start free trial <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
