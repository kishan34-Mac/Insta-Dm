import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-10 sm:py-16 lg:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-lg border border-border p-6 sm:p-10 md:p-16 text-center bg-card shadow-sm"
        >
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.025em] text-balance max-w-2xl mx-auto">
              Stop losing leads in your <span className="text-primary font-medium">comment section</span>.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Join 12,000+ creators who turned engagement into revenue. Start in minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">Start free trial <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
