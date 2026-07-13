import { useState } from "react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Briefcase, Heart, Cpu, FileText, CheckCircle2, 
  HelpCircle, ArrowRight, UploadCloud, Users, Sparkles
} from "lucide-react";

export default function Careers() {
  useSEO({
    title: "Careers - Join Our Remote Developer Team",
    description: "Apply for software engineer, UI designer, or customer success careers at DMPilot. Review employee benefits, hiring process, and submit applications.",
    keywords: "dmpilot jobs, remote engineer careers, startup positions, code jobs"
  });

  const [activeJob, setActiveJob] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    portfolio: "",
    resume: "",
    coverLetter: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.resume) {
      toast.error("Please fill in Name, Email, and upload/paste your Resume.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Application submitted successfully! Our recruitment team will email you soon.");
      setFormData({ name: "", email: "", portfolio: "", resume: "", coverLetter: "" });
      setActiveJob(null);
    }, 1500);
  };

  const benefits = [
    { icon: <Cpu className="h-5 w-5 text-primary" />, title: "Remote-First", desc: "Work from anywhere in the world. We offer scheduling autonomy." },
    { icon: <Heart className="h-5 w-5 text-primary" />, title: "Unlimited PTO", desc: "Take breaks when you need them. We prioritize psychological safety and rest." },
    { icon: <Briefcase className="h-5 w-5 text-primary" />, title: "Health Stipends", desc: "A monthly fund for physical workouts, dental care, and mental health counseling." },
    { icon: <Users className="h-5 w-5 text-primary" />, title: "Annual Retreats", desc: "We host yearly team sync meetups in scenic, relaxing getaways." }
  ];

  const jobs = [
    {
      id: "full-stack",
      title: "Senior Full Stack Engineer (React/Node)",
      team: "Engineering",
      location: "Remote (Global)",
      salary: "$120,000 - $160,000",
      description: "Scale high-throughput Meta Graph webhooks, maintain Express API microservices, and build UI views using React, TailwindCSS, and TypeScript.",
      reqs: ["4+ years node production experience", "Proficiency in PostgreSQL, Prisma ORM, and Redis key-stores", "Experience setting up secure OAuth integrations"]
    },
    {
      id: "ai-engineer",
      title: "AI Integrations Engineer (LLMs/RAG)",
      team: "AI Research",
      location: "Remote (US/EU)",
      salary: "$130,000 - $170,000",
      description: "Design conversational workflows, leverage OpenAI GPT-4 context variables, compile vector similarity caches, and lower customer agent response delay.",
      reqs: ["Proven experience engineering LLM prompts and fine-tunes", "Familiarity with Python, LangChain, or Node AI wrappers", "Commitment to privacy guidelines"]
    },
    {
      id: "designer",
      title: "Lead UI/UX Designer",
      team: "Product Design",
      location: "Remote (Global)",
      salary: "$100,000 - $130,000",
      description: "Own the visual identity of our analytics dashboards, construct pixel-perfect wireframes, design dark canvas systems, and orchestrate animations.",
      reqs: ["Portfolio showcasing complex dashboard platforms", "Deep expertise in Figma and component library styling systems", "Eye for micro-interactions"]
    }
  ];

  const stages = [
    { num: "01", title: "CV Review", desc: "Our HR specialists evaluate code repositories and technical portfolios." },
    { num: "02", title: "Take-Home Task", desc: "A minor, real-world task representing standard DMPilot workflow tickets." },
    { num: "03", title: "Technical Review", desc: "A 45-minute live pair-programming call with core system engineers." },
    { num: "04", title: "Culture Call", desc: "Get to know founders and team leaders to confirm project alignment." }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Careers Hero */}
        <section className="relative overflow-hidden py-16 text-center">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="container relative px-4 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 border border-primary/20">
                <Briefcase className="h-3.5 w-3.5" /> Work with Us
              </span>
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6">
                Build the Future of <span className="text-primary">Chat Commerce</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Join a fast-moving, remote-first team constructing next-gen direct message automation engines.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-12 border-t border-border">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Company Culture & Benefits</h2>
              <p className="text-muted-foreground text-sm">We provide standard stipends and setups to ensure your home workspace is fully optimized.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((ben, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3">
                  <div className="p-2 bg-secondary rounded-lg border w-fit">{ben.icon}</div>
                  <h4 className="font-bold text-sm text-foreground">{ben.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ben.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-20 bg-secondary/20 border-y border-border">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-10">Available Roles</h2>
            
            <div className="space-y-6">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{job.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{job.team}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="text-primary font-semibold font-mono">{job.salary}</span>
                      </div>
                    </div>
                    <Button 
                      variant={activeJob === job.id ? "outline" : "default"} 
                      size="sm" 
                      onClick={() => setActiveJob(activeJob === job.id ? null : job.id)}
                      className="text-xs"
                    >
                      {activeJob === job.id ? "Collapse Role" : "Apply Now"}
                    </Button>
                  </div>

                  {activeJob === job.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-4 border-t border-border space-y-4"
                    >
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{job.description}</p>
                      
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-foreground">Role Requirements:</h5>
                        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-5">
                          {job.reqs.map((req, rIdx) => <li key={rIdx}>{req}</li>)}
                        </ul>
                      </div>

                      {/* Application Form Embedded inside Job Detail */}
                      <form onSubmit={handleSubmit} className="p-4 bg-secondary/50 rounded-lg border space-y-4 mt-6">
                        <h5 className="font-bold text-sm flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> Apply for {job.title}</h5>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</label>
                            <Input
                              type="text"
                              placeholder="Kishan Kumar"
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="h-9 text-xs bg-card border-border"
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
                              className="h-9 text-xs bg-card border-border"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Portfolio/GitHub URL</label>
                            <Input
                              type="url"
                              placeholder="https://github.com/profile"
                              value={formData.portfolio}
                              onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                              className="h-9 text-xs bg-card border-border"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Resume/CV Details (Link or raw text)</label>
                            <Input
                              type="text"
                              placeholder="Link to PDF or key details"
                              value={formData.resume}
                              onChange={(e) => setFormData(prev => ({ ...prev, resume: e.target.value }))}
                              className="h-9 text-xs bg-card border-border"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">Why do you want to join DMPilot?</label>
                          <Textarea
                            placeholder="Tell us about your passion for automations..."
                            value={formData.coverLetter}
                            onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                            className="text-xs bg-card border-border min-h-[80px]"
                          />
                        </div>

                        <Button type="submit" variant="hero" size="sm" className="w-full text-xs font-semibold" disabled={submitting}>
                          {submitting ? "Submitting application..." : "Submit Application"}
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hiring pipeline */}
        <section className="py-20">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Our Hiring Process</h2>
            <div className="grid gap-6 sm:grid-cols-4">
              {stages.map((stg, idx) => (
                <div key={idx} className="p-4 rounded-xl border bg-card text-center relative shadow-sm">
                  <span className="text-3xl font-extrabold text-primary/20 block font-mono mb-2">{stg.num}</span>
                  <h5 className="font-bold text-sm text-foreground mb-1">{stg.title}</h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{stg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-secondary/10 border-t border-border">
          <div className="container px-4 mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-8">What Our Team Says</h2>
            <div className="p-6 rounded-xl border bg-card shadow-sm text-left relative overflow-hidden">
              <span className="absolute -top-6 -right-6 text-7xl font-extrabold text-secondary/30 select-none">"</span>
              <p className="text-sm text-muted-foreground italic mb-4 leading-relaxed">
                "Work autonomy here is real. I reside in Bali and coordinate with lead engineers in New York and Paris. Since we maintain clean codebases and operate on clear webhook documentation guidelines, we deploy complex updates safely without late hour stressors."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-secondary rounded-full border flex items-center justify-center font-bold text-xs">SL</div>
                <div>
                  <h6 className="font-bold text-sm">Sarah L.</h6>
                  <span className="text-[10px] text-muted-foreground">Lead AI Developer</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
