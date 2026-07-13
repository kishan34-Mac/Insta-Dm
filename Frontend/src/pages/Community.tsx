import { useState } from "react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Users, MessageSquare, Github, GitMerge,
  ThumbsUp, Calendar, AlertCircle, FileText, Send,
  ArrowRight, Sparkles
} from "lucide-react";

export default function Community() {
  useSEO({
    title: "Developer Community - Join Our Network",
    description: "Join DMPilot's Discord server, participate in developer forums, upvote our feature roadmap, report bugs on GitHub, and subscribe to our newsletter.",
    keywords: "discord community, github project tracker, feature voting roadmap, events meetup"
  });

  const [votes, setVotes] = useState<Record<string, number>>({
    "whatsapp": 142,
    "carousel": 98,
    "agents": 210
  });
  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({});
  const [emailInput, setEmailInput] = useState("");

  const handleVote = (id: string) => {
    if (hasVoted[id]) {
      setVotes(prev => ({ ...prev, [id]: prev[id] - 1 }));
      setHasVoted(prev => ({ ...prev, [id]: false }));
      toast.info("Retracted your roadmap vote.");
    } else {
      setVotes(prev => ({ ...prev, [id]: prev[id] + 1 }));
      setHasVoted(prev => ({ ...prev, [id]: true }));
      toast.success("Voted up! Thanks for participating.");
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Subscribed! Check your inbox for updates.");
    setEmailInput("");
  };

  const communityHubs = [
    {
      name: "Discord Server",
      desc: "Connect, debug, share custom marketing campaigns, and chat in real-time with 4,000+ automation builders.",
      icon: <MessageSquare className="h-6 w-6 text-[#5865f2]" />,
      actionLabel: "Join Discord",
      link: "#"
    },
    {
      name: "GitHub Repositories",
      desc: "Check our open source wrappers, SDK frameworks, and examples. Report bugs and submit PRs directly.",
      icon: <Github className="h-6 w-6 text-foreground" />,
      actionLabel: "Fork SDK Repository",
      link: "#"
    },
    {
      name: "Developer Forum",
      desc: "Detailed discussion threads covering webhooks configuration, security permissions, and API usage tips.",
      icon: <Users className="h-6 w-6 text-primary" />,
      actionLabel: "Enter Forums",
      link: "#"
    }
  ];

  const roadmapItems = [
    {
      id: "agents",
      quarter: "Q3 2026",
      title: "Interactive AI Voice Agents",
      desc: "Integrate context LLMs directly into voice transcripts to auto-answer customer queries via audio calls.",
      votesKey: "agents"
    },
    {
      id: "whatsapp",
      quarter: "Q4 2026",
      title: "WhatsApp Campaign Flows",
      desc: "Launch direct messaging campaigns and support sequences via official WhatsApp Business numbers.",
      votesKey: "whatsapp"
    },
    {
      id: "carousel",
      quarter: "Q1 2027",
      title: "Post Carousel Photo-DMs",
      desc: "Parse custom tags inside image carousels to dispatch specific files depending on which photo is commented.",
      votesKey: "carousel"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Community Header */}
        <section className="relative overflow-hidden py-16 text-center">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="container relative px-4 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 border border-primary/20">
                <Users className="h-3.5 w-3.5" /> Built for Automators
              </span>
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6">
                Connect with the <span className="text-primary">Community</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Share campaign strategies, vote on our technical roadmap, download open-source SDK files, and join live developer webinars.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Hub Cards */}
        <section className="py-12">
          <div className="container px-4 mx-auto">
            <div className="grid gap-6 md:grid-cols-3">
              {communityHubs.map((hub, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-border bg-card flex flex-col justify-between hover:shadow-sm transition-all">
                  <div className="space-y-4">
                    <div className="p-3 bg-secondary rounded-lg w-fit border border-border">
                      {hub.icon}
                    </div>
                    <h3 className="text-lg font-bold">{hub.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{hub.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold" asChild>
                      <a href={hub.link}>{hub.actionLabel}</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap Voting */}
        <section className="py-20 bg-secondary/20 border-y border-border">
          <div className="container px-4 mx-auto max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                Co-Created Features
              </span>
              <h2 className="text-3xl font-bold tracking-tight mt-3 mb-3">Vote Our Roadmap</h2>
              <p className="text-muted-foreground text-sm">We build features suggested by our creators. Upvote next quarter releases directly.</p>
            </div>

            <div className="space-y-4">
              {roadmapItems.map((item, idx) => {
                const voted = hasVoted[item.id] || false;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    className="p-5 rounded-xl border border-border bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-sm transition-all"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded font-mono border border-primary/20">
                        {item.quarter}
                      </span>
                      <h4 className="text-base font-bold text-foreground mt-2">{item.title}</h4>
                      <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">{item.desc}</p>
                    </div>

                    <Button
                      variant={voted ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote(item.id)}
                      className="text-xs shrink-0 flex items-center gap-2 self-end sm:self-center"
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${voted ? "fill-current" : ""}`} />
                      <span>{votes[item.votesKey]} Votes</span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Guidelines, Events & Bug Reports */}
        <section className="py-20">
          <div className="container px-4 mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Guidelines & Forum */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Community Guidelines
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We expect creators to construct polite, ethical messaging templates. Any accounts sending spam links, abusive materials, or spoof payloads will face immediate restrictions in accordance with Meta security APIs.
                </p>
                <div className="p-4 rounded-lg bg-secondary border border-border text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2"><GitMerge className="h-4 w-4 text-primary shrink-0" /> Avoid sending repetitive DMs to single accounts.</div>
                  <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-primary shrink-0" /> Explicitly declare links or guide contents.</div>
                </div>
              </div>

              {/* Webinars & Events */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Upcoming Events & Webinars
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Join our technical integration meetups. We present live campaigns code-alongs and host product feedback QA sessions monthly.
                </p>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg bg-card flex justify-between items-center text-xs">
                    <div>
                      <h5 className="font-bold">Instagram DM Funnels Q&A</h5>
                      <span className="text-[10px] text-muted-foreground">July 22, 2026 · Online Webinar</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold">Register</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup Form */}
        <section className="py-16 bg-primary/5 border-t border-border">
          <div className="container px-4 mx-auto text-center max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Subscribe to our Product Newsletter</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mb-6">
              Get monthly updates on code versions, automation blueprints, and developer tutorials.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <Input
                type="email"
                placeholder="developer@dmpilot.ai"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="h-10 text-sm bg-card border-border"
              />
              <Button type="submit" variant="hero" className="shrink-0 flex items-center gap-2 text-xs">
                <Send className="h-3.5 w-3.5" /> Subscribe
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
