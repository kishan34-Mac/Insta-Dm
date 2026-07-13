import { useState } from "react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { toast } from "sonner";
import { 
  Terminal, ShieldCheck, Database, Key, 
  Copy, Check, ChevronRight, Server, AlertTriangle
} from "lucide-react";

export default function ApiReference() {
  useSEO({
    title: "API Reference - Developer REST Endpoints",
    description: "Explore the DMPilot REST API specification. Review authentication headers, parameters, JSON requests, and cURL snippets.",
    keywords: "instagram API reference, webhook events schema, campaign REST triggers, response codes"
  });

  const [activeTab, setActiveTab] = useState<"curl" | "node" | "python">("curl");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Snippet copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const endpoints = [
    {
      id: "auth",
      method: "HEADER",
      path: "Authorization",
      title: "Authentication",
      description: "Supply your API key inside the HTTP request headers using Bearer token format.",
      params: [
        { name: "Authorization", type: "string", required: true, desc: "Bearer <YOUR_SECRET_KEY>" }
      ],
      code: {
        curl: `curl -H "Authorization: Bearer key_live_891238"\n  https://api.dmpilot.ai/v1/campaigns`,
        node: `const client = new DMPilot({ apiKey: 'key_live_891238' });`,
        python: `client = DMPilot(api_key='key_live_891238')`
      },
      response: `{\n  "authenticated": true,\n  "scope": "campaigns.write"\n}`
    },
    {
      id: "trigger-dm",
      method: "POST",
      path: "/v1/campaigns/trigger",
      title: "Trigger Direct DM",
      description: "Dispatch an automated sequence flow directly to an Instagram follower's inbox programmatically.",
      params: [
        { name: "campaignId", type: "string", required: true, desc: "Identifier of target sequence campaign." },
        { name: "instagramHandle", type: "string", required: true, desc: "Recipient Instagram username handle." },
        { name: "variables", type: "object", required: false, desc: "Key-value variables to substitute in messages." }
      ],
      code: {
        curl: `curl -X POST https://api.dmpilot.ai/v1/campaigns/trigger \\\n  -H "Authorization: Bearer key_live_891238" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "campaignId": "camp_813",\n    "instagramHandle": "sarah.codes",\n    "variables": { "code": "OFFER20" }\n  }'`,
        node: `await client.campaigns.trigger({\n  campaignId: "camp_813",\n  instagramHandle: "sarah.codes",\n  variables: { code: "OFFER20" }\n});`,
        python: `client.campaigns.trigger(\n  campaign_id="camp_813",\n  instagram_handle="sarah.codes",\n  variables={ "code": "OFFER20" }\n)`
      },
      response: `{\n  "success": true,\n  "messageId": "msg_901231",\n  "status": "delivered"\n}`
    },
    {
      id: "get-leads",
      method: "GET",
      path: "/v1/leads",
      title: "Get Lead List",
      description: "Query and extract a paginated list of captured lead items with custom sorting.",
      params: [
        { name: "limit", type: "integer", required: false, desc: "Quantity of items to load (default: 20, max: 100)." },
        { name: "cursor", type: "string", required: false, desc: "Pagination cursor token for next page index." }
      ],
      code: {
        curl: `curl https://api.dmpilot.ai/v1/leads?limit=2 \\\n  -H "Authorization: Bearer key_live_891238"`,
        node: `const leads = await client.leads.list({ limit: 2 });`,
        python: `leads = client.leads.list(limit=2)`
      },
      response: `{\n  "data": [\n    {\n      "id": "lead_01",\n      "username": "sarah.codes",\n      "email": "sarah@gmail.com"\n    }\n  ],\n  "nextCursor": "cur_98123"\n}`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 min-h-screen">
        <div className="container px-4 py-8 mx-auto">
          {/* Header */}
          <div className="mb-10 max-w-4xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4 border border-primary/20">
              <Server className="h-3.5 w-3.5" /> REST API v1.0
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">API Reference Guide</h1>
            <p className="text-sm text-muted-foreground">
              Integrate, trigger, and sync DMPilot campaigns programmatically. Check rate limits, endpoints, and requests.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_450px]">
            {/* Endpoints & Parameter Specs */}
            <div className="space-y-12">
              {/* Core Limits Info */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3 text-xs">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-primary" /> API Guidelines & Limits
                </h4>
                <div className="grid gap-4 sm:grid-cols-2 text-muted-foreground leading-relaxed">
                  <div>
                    <span className="font-semibold text-foreground">Rate Limits:</span> Standard accounts permit up to 120 calls per minute. Exceeding triggers a <code>429 Too Many Requests</code>.
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Pagination:</span> List resources use forward cursor tokens (<code>nextCursor</code>).
                  </div>
                </div>
              </div>

              {/* Endpoints Details */}
              {endpoints.map((ep) => (
                <div key={ep.id} className="space-y-4 pb-8 border-b last:border-b-0 border-border">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      ep.method === "POST" 
                        ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                        : ep.method === "GET"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-secondary text-muted-foreground border"
                    }`}>
                      {ep.method}
                    </span>
                    <code className="text-sm font-semibold text-foreground font-mono">{ep.path}</code>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground">{ep.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{ep.description}</p>
                  </div>

                  {/* Request Parameters Grid */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request Headers/Parameters</h5>
                    <div className="border border-border rounded-lg bg-card overflow-hidden">
                      <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                        <thead>
                          <tr className="border-b bg-secondary/50 font-semibold text-muted-foreground">
                            <th className="p-3">Field</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Requirement</th>
                            <th className="p-3">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-muted-foreground">
                          {ep.params.map((param, pIdx) => (
                            <tr key={pIdx}>
                              <td className="p-3 font-mono text-foreground font-semibold">{param.name}</td>
                              <td className="p-3 font-mono">{param.type}</td>
                              <td className="p-3">
                                {param.required ? (
                                  <span className="text-primary font-bold">required</span>
                                ) : (
                                  <span>optional</span>
                                )}
                              </td>
                              <td className="p-3">{param.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}

              {/* Error Status Code Table */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">Response Codes</h3>
                <div className="border border-border rounded-lg bg-card overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3">Code</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-muted-foreground">
                      <tr>
                        <td className="p-3 font-mono text-emerald-500 font-bold">200 / 201</td>
                        <td className="p-3">Success</td>
                        <td className="p-3">Action performed successfully or resource created.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-red-500 font-bold">400</td>
                        <td className="p-3">Bad Request</td>
                        <td className="p-3">Missing required parameters or malformed JSON payloads.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-red-500 font-bold">401</td>
                        <td className="p-3">Unauthorized</td>
                        <td className="p-3">API Key is missing, revoked, or formatted incorrectly.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-red-500 font-bold">429</td>
                        <td className="p-3">Rate Limited</td>
                        <td className="p-3">Account exceeded standard rate call limits.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Interactive Code Console Pane */}
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
              <div className="rounded-xl border border-border bg-[#0e0e11] overflow-hidden text-xs font-mono shadow-lg">
                <div className="flex items-center justify-between bg-[#18181c] border-b border-[#26262b] px-4 py-2 text-[#9a9a9a]">
                  <span className="font-semibold flex items-center gap-1.5"><Terminal className="h-4 w-4" /> Request Samples</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("curl")}
                      className={`px-2 py-1.5 rounded transition-all ${activeTab === "curl" ? "bg-primary text-primary-foreground font-bold" : "hover:text-white"}`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setActiveTab("node")}
                      className={`px-2 py-1.5 rounded transition-all ${activeTab === "node" ? "bg-primary text-primary-foreground font-bold" : "hover:text-white"}`}
                    >
                      Node
                    </button>
                    <button
                      onClick={() => setActiveTab("python")}
                      className={`px-2 py-1.5 rounded transition-all ${activeTab === "python" ? "bg-primary text-primary-foreground font-bold" : "hover:text-white"}`}
                    >
                      Python
                    </button>
                  </div>
                </div>

                {/* Display Sample Snippet */}
                <div className="p-4 space-y-4">
                  {endpoints.map((ep) => (
                    <div key={ep.id} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-[#707070] border-b border-[#1e1e24] pb-1.5">
                        <span>{ep.title} Sample</span>
                        <button
                          onClick={() => handleCopy(`${ep.id}-${activeTab}`, ep.code[activeTab])}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {copiedId === `${ep.id}-${activeTab}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          Copy
                        </button>
                      </div>
                      <pre className="text-white whitespace-pre-wrap overflow-x-auto text-[10px] leading-relaxed">
                        {ep.code[activeTab]}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Responses Console */}
              <div className="rounded-xl border border-border bg-[#0e0e11] overflow-hidden text-xs font-mono shadow-lg">
                <div className="bg-[#18181c] border-b border-[#26262b] px-4 py-2 text-[#9a9a9a] font-semibold flex items-center justify-between">
                  <span>Response Headers & Payloads</span>
                  <span className="text-[10px] text-[#707070]">200 OK</span>
                </div>
                <div className="p-4 space-y-6">
                  {endpoints.map((ep) => (
                    <div key={ep.id} className="space-y-2">
                      <div className="text-[10px] text-[#707070] border-b border-[#1e1e24] pb-1.5">
                        <span>{ep.title} Response</span>
                      </div>
                      <pre className="text-emerald-400 whitespace-pre-wrap overflow-x-auto text-[10px] leading-relaxed">
                        {ep.response}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
