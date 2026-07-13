import { useState } from "react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Search, BookOpen, Terminal, Code, Settings,
  Copy, Check, FileText, HelpCircle, ArrowRight
} from "lucide-react";

export default function Documentation() {
  useSEO({
    title: "Documentation - Developer guides",
    description: "Read documentation on how to configure DMPilot Instagram automations, integrate client webhooks, trigger AI sequences, and access direct endpoints.",
    keywords: "instagram documentation, api keys setup, webhook deployment, chatbot installation"
  });

  const [activeSection, setActiveSection] = useState("getting-started");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Code snippet copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const navItems = [
    { id: "getting-started", label: "Getting Started", icon: <BookOpen className="h-4 w-4" /> },
    { id: "installation", label: "Installation", icon: <Terminal className="h-4 w-4" /> },
    { id: "authentication", label: "Authentication", icon: <Settings className="h-4 w-4" /> },
    { id: "api-usage", label: "API Usage", icon: <Code className="h-4 w-4" /> },
    { id: "webhook-setup", label: "Webhook Setup", icon: <GitBranchIcon /> },
    { id: "campaign-creation", label: "Campaign Creation", icon: <FileText className="h-4 w-4" /> },
    { id: "faq", label: "Developer FAQs", icon: <HelpCircle className="h-4 w-4" /> }
  ];

  function GitBranchIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-3-3m3 3l3-3" /></svg>;
  }

  const codeSnippets = {
    install: `npm install @dmpilot/sdk`,
    auth: `import { DMPilot } from '@dmpilot/sdk';\n\nconst client = new DMPilot({\n  apiKey: process.env.DMPILOT_API_KEY\n});`,
    api: `// Trigger a direct DM message via REST API\nconst response = await client.campaigns.trigger({\n  campaignId: "camp_8923a1b",\n  instagramHandle: "sarah.codes",\n  variables: {\n    guideName: "Insta-Growth-2026"\n  }\n});`
  };

  // Basic search filter of navItems
  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 min-h-screen">
        <div className="container px-4 py-8 mx-auto">
          <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
            
            {/* Sidebar Navigation */}
            <aside className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs border-border bg-card"
                />
              </div>

              <nav className="space-y-1">
                {filteredNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-sm transition-all ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Documentation Content Panel */}
            <article className="prose dark:prose-invert max-w-none bg-card border border-border p-6 rounded-xl shadow-sm">
              {activeSection === "getting-started" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-extrabold tracking-tight">Getting Started</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    DMPilot is an automated conversational platform that captures leads, delivers links, and schedules conversion guides for creators and brands using Instagram Direct Messages.
                  </p>
                  <h3 className="text-lg font-bold text-foreground">Core Core Concepts</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="bg-secondary p-4 rounded border text-xs">
                      <h5 className="font-bold text-foreground mb-1">Triggers</h5>
                      <p className="text-muted-foreground leading-relaxed">Actions by followers (e.g. comment keywords, story mentions) that launch automation campaigns.</p>
                    </div>
                    <div className="bg-secondary p-4 rounded border text-xs">
                      <h5 className="font-bold text-foreground mb-1">Sequences</h5>
                      <p className="text-muted-foreground leading-relaxed">A set of direct messages, multiple-choice options, and delay states managed by our bot.</p>
                    </div>
                    <div className="bg-secondary p-4 rounded border text-xs">
                      <h5 className="font-bold text-foreground mb-1">Leads</h5>
                      <p className="text-muted-foreground leading-relaxed">Extracted usernames, email links, and choices sync'd directly to CRM pipelines.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "installation" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-extrabold tracking-tight">Installation</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Integrate DMPilot directly into your Node projects using our lightweight wrapper library.
                  </p>
                  <div className="relative bg-secondary border p-4 rounded font-mono text-xs text-foreground flex items-center justify-between">
                    <span>{codeSnippets.install}</span>
                    <button
                      onClick={() => handleCopy("install", codeSnippets.install)}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Copy code block"
                    >
                      {copiedId === "install" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {activeSection === "authentication" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-extrabold tracking-tight">Authentication</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    API calls require a valid Bearer API key in request headers. Create key tokens within the user dashboard under `Settings &rarr; API Settings`.
                  </p>
                  <div className="relative bg-secondary border p-4 rounded font-mono text-xs text-foreground">
                    <pre className="whitespace-pre-wrap">{codeSnippets.auth}</pre>
                    <button
                      onClick={() => handleCopy("auth", codeSnippets.auth)}
                      className="absolute right-4 top-4 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Copy code block"
                    >
                      {copiedId === "auth" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {activeSection === "api-usage" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-extrabold tracking-tight">API Usage</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Trigger custom sequences and dispatch conversion documents to users programmatically using Node client instances.
                  </p>
                  <div className="relative bg-secondary border p-4 rounded font-mono text-xs text-foreground">
                    <pre className="whitespace-pre-wrap">{codeSnippets.api}</pre>
                    <button
                      onClick={() => handleCopy("api", codeSnippets.api)}
                      className="absolute right-4 top-4 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Copy code block"
                    >
                      {copiedId === "api" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {activeSection === "webhook-setup" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-extrabold tracking-tight">Webhook Setup</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Register custom target endpoints in our dashboard. We will POST webhook events containing parameters, usernames, and timestamp payloads.
                  </p>
                  <h4 className="font-bold mt-4">Expected payload:</h4>
                  <div className="bg-secondary border p-4 rounded font-mono text-xs text-muted-foreground">
                    {`{\n  "event": "lead.captured",\n  "timestamp": "2026-07-11T14:00:00Z",\n  "data": {\n    "username": "sarah.codes",\n    "campaignId": "camp_8923a1b",\n    "details": {\n      "email": "sarah@gmail.com"\n    }\n  }\n}`}
                  </div>
                </div>
              )}

              {activeSection === "campaign-creation" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-extrabold tracking-tight">Campaign Creation</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Set up your message schedules. Launch custom automation chains for story mentions, keywords, or post comments directly.
                  </p>
                  <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-2">
                    <li>Go to the <span className="text-foreground font-semibold">Campaigns</span> panel in your dashboard.</li>
                    <li>Click <span className="text-foreground font-semibold">New Campaign</span>.</li>
                    <li>Input trigger keywords (e.g., 'GUIDE') and write response messages.</li>
                    <li>Toggle the campaign status to <span className="text-primary font-semibold font-mono">LIVE</span>.</li>
                  </ol>
                </div>
              )}

              {activeSection === "faq" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-extrabold tracking-tight">Developer FAQs</h1>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-foreground font-semibold">What is the API Rate Limit?</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">Standard keys permit up to 120 API requests/minute. Enterprise setups can request custom limits.</p>
                    </div>
                    <div>
                      <h4 className="text-foreground font-semibold">Can I pass custom variables into automated DMs?</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">Yes. In webhooks or API triggers, supply variables key-values to insert them dynamically in messages.</p>
                    </div>
                  </div>
                </div>
              )}

            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
