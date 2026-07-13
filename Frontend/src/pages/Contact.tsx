import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { 
  Mail, Phone, MapPin, Clock, MessageSquare, 
  Send, HelpCircle, Heart, ArrowRight, ShieldCheck
} from "lucide-react";

export default function Contact() {
  useSEO({
    title: "Contact Us - Customer Support & Live Chat",
    description: "Get in touch with the DMPilot support team. Submit a support ticket, start a live chat simulator, view office coordinates, or review support hours.",
    keywords: "instagram support, contact email, office hours, customer success chat"
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in Name, Email, and Message fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Support ticket created! We will respond within 4 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  const handleLiveChat = () => {
    toast.success("Connecting to a live agent... (Simulated chat interface initialized in dashboard)");
  };

  const contactDetails = [
    { icon: <Mail className="h-5 w-5 text-primary" />, title: "Email Support", desc: "support@dmpilot.ai", sub: "Replies under 4 hours." },
    { icon: <Phone className="h-5 w-5 text-primary" />, title: "Phone Line", desc: "+1 (888) 901-2311", sub: "Mon-Fri, 9am - 6pm EST." },
    { icon: <MapPin className="h-5 w-5 text-primary" />, title: "Office Location", desc: "100 Pine Street, Suite 1200", sub: "San Francisco, CA 94111." }
  ];

  const faqs = [
    {
      q: "What is your standard support response time?",
      a: "For Professional and Enterprise plans, we offer live priority chat and phone support with average response speeds under 15 minutes. Free and Starter profiles get email answers in under 24 hours."
    },
    {
      q: "Can I schedule a live demo call?",
      a: "Absolutely! Contact our sales team using the contact form, select 'Demo Request' in the subject field, and we will email you a calendar scheduler link."
    },
    {
      q: "Do you offer developer migration services?",
      a: "Yes. For corporate enterprise migrations, our integration technicians coordinate database sync pipelines and custom CRM mappings free of charge."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Contact Hero */}
        <section className="relative overflow-hidden py-16 text-center">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="container relative px-4 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 border border-primary/20">
                <MessageSquare className="h-3.5 w-3.5" /> 24/7 Global Support
              </span>
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6">
                Let's Start a <span className="text-primary">Conversation</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Submit an integration ticket, request bulk agency demo licenses, or coordinate API developer setups.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form and Contact info */}
        <section className="py-12 border-t border-border">
          <div className="container px-4 mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2">
              
              {/* Form panel */}
              <motion.div
                initial={{ opacity: 0, x: -35 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">Submit a Ticket</h3>
                  <p className="text-xs text-muted-foreground">Fill in details and our technical operations desk will follow up quickly.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Your Name</label>
                      <Input
                        type="text"
                        placeholder="Kishan"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="h-10 text-xs bg-secondary/50 border-border"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</label>
                      <Input
                        type="email"
                        placeholder="kishan@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-10 text-xs bg-secondary/50 border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Subject / Context</label>
                    <Input
                      type="text"
                      placeholder="e.g. Zapier Connection Error"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="h-10 text-xs bg-secondary/50 border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Message Details</label>
                    <Textarea
                      placeholder="Describe triggers, console payloads, or campaign issues..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="text-xs bg-secondary/50 border-border min-h-[120px]"
                      required
                    />
                  </div>

                  <Button type="submit" variant="hero" className="w-full text-xs font-semibold" disabled={loading}>
                    {loading ? "Submitting details..." : "Dispatch Ticket"}
                  </Button>
                </form>
              </motion.div>

              {/* Info panel */}
              <motion.div
                initial={{ opacity: 0, x: 35 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Details list */}
                <div className="grid gap-6">
                  {contactDetails.map((det, idx) => (
                    <div key={idx} className="flex gap-4 p-4 border bg-card rounded-xl shadow-sm">
                      <div className="p-2.5 bg-secondary rounded-lg border h-fit text-primary shrink-0">{det.icon}</div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{det.title}</h4>
                        <p className="text-sm font-semibold text-primary mt-1 font-mono">{det.desc}</p>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">{det.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Google Map */}
                <div className="relative border rounded-xl overflow-hidden h-44 bg-secondary shadow-sm">
                  {/* Decorative mesh map layout */}
                  <div className="absolute inset-0 bg-[#0e0e11] opacity-20 pointer-events-none" />
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-primary/20 text-primary text-[9px] font-bold px-2 py-0.5 rounded border border-primary/30 uppercase tracking-wider font-mono">
                        Office Coordinates
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">37.7915° N, 122.3995° W</span>
                    </div>

                    <div className="text-center">
                      <MapPin className="h-6 w-6 text-primary animate-bounce mx-auto" />
                      <span className="text-[10px] font-semibold text-foreground block mt-1">Pine St. HQ, SF</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-muted-foreground">Google Maps Simulator Active</span>
                    </div>
                  </div>
                </div>

                {/* Instant Support Ticker */}
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-xs">Live Chat Simulator</h5>
                    <p className="text-[10px] text-muted-foreground">Average wait queues: <strong>32 seconds</strong>.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLiveChat} className="text-xs font-semibold gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" /> Start Chat
                  </Button>
                </div>

              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-secondary/20 border-t border-border">
          <div className="container px-4 mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-10">Support FAQs</h2>
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
      </main>

      <Footer />
    </div>
  );
}
