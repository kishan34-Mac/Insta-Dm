import { motion } from "framer-motion";
import { MessageSquare, Send, UserCheck } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Set keyword triggers",
    desc: "Pick the words your audience uses — 'link', 'price', 'guide'. We listen 24/7.",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: Send,
    title: "Auto-DM on autopilot",
    desc: "Every matching comment gets an instant, personalized DM sequence with your offer.",
    color: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: UserCheck,
    title: "Capture & convert leads",
    desc: "Leads land in your CRM. Track clicks, replies and revenue per campaign.",
    color: "from-cyan-500 to-blue-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-10 sm:py-16 lg:py-20 relative">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.025em] text-balance">
            Three steps to <span className="text-primary font-medium">automated revenue</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Set up in under 5 minutes. No engineers needed.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-6">
          {/* connecting line */}
          <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-border" />

          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              <div className="border border-border bg-card p-6 rounded-lg h-full shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-5">
                  <div className="h-12 w-12 rounded-sm bg-secondary border border-border flex items-center justify-center text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-3xl font-bold text-muted-foreground/30">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
