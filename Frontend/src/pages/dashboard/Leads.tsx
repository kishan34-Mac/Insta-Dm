import { useEffect, useState, useCallback } from "react";
import { Search, Edit3, X, Save, Tag as TagIcon, StickyNote, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { leadApi, Lead } from "@/api/leads";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeStore } from "@/store/realtime.store";

export default function Leads() {
  const [q, setQ] = useState("");
  const { leads, setLeads } = useRealtimeStore();
  const [isLoading, setIsLoading] = useState(leads.length === 0);
  const [error, setError] = useState<string | null>(null);

  // CRM Lead detail editing modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState<string>("new");
  const [editNotes, setEditNotes] = useState<string>("");
  const [editTags, setEditTags] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await leadApi.getAll();
      setLeads(res.data || []);
      setError(null);
    } catch (error) {
      console.error("FETCH LEADS ERROR:", error);
      setError("Unable to sync leads CRM data.");
    } finally {
      setIsLoading(false);
    }
  }, [setLeads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleOpenEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status || "new");
    setEditNotes(lead.notes || "");
    setEditTags(lead.tags?.join(", ") || "");
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;
    setIsSaving(true);
    try {
      const parsedTags = editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await leadApi.update(selectedLead._id, {
        status: editStatus,
        notes: editNotes,
        tags: parsedTags,
      });

      if (res.success && res.data) {
        // Update store state
        const updatedLeads = leads.map((l) => (l._id === selectedLead._id ? { ...l, ...res.data } : l));
        setLeads(updatedLeads);
        setSelectedLead(null);
      }
    } catch (err) {
      console.error("SAVE LEAD ERROR:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = leads.filter(
    (lead) =>
      lead.igUsername?.toLowerCase()?.includes(q.toLowerCase()) ||
      lead.comment?.toLowerCase()?.includes(q.toLowerCase()) ||
      lead.keyword?.toLowerCase()?.includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[80vh]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Leads CRM</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real Instagram leads matched by campaigns automation.
          </p>
        </div>
        {error && (
          <span className="text-xs px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive-foreground">
            ⚠️ {error}
          </span>
        )}
      </div>

      <div className="glass-card overflow-hidden border border-border rounded-xl">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by username, comment, or keyword..."
              className="pl-9 bg-zinc-950 border-zinc-800 text-white rounded-xl focus-visible:ring-primary"
            />
          </div>

          <span className="text-xs text-muted-foreground ml-auto bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full font-medium">
            {filtered.length} leads in CRM
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 text-left bg-zinc-950/20">
                <th className="px-5 py-3 font-semibold">Username</th>
                <th className="px-5 py-3 font-semibold">Matched Keyword</th>
                <th className="px-5 py-3 font-semibold">Trigger Comment</th>
                <th className="px-5 py-3 font-semibold">Campaign Name</th>
                <th className="px-5 py-3 font-semibold">Tags</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Time Captured</th>
                <th className="px-5 py-3 font-semibold text-center">Manage</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-900">
                    <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-5 py-4 text-center"><Skeleton className="h-6 w-6 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground text-zinc-500 bg-zinc-950/10">
                    No leads found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => {
                  let statusColor = "bg-zinc-800 text-zinc-400 border-zinc-700";
                  if (lead.status === "new") statusColor = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                  if (lead.status === "contacted") statusColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
                  if (lead.status === "replied") statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                  if (lead.status === "won") statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                  if (lead.status === "lost") statusColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";

                  const campaignName = lead.campaigns?.[0]?.name || "Instagram Campaign";

                  return (
                    <motion.tr
                      key={lead._id}
                      className="border-b border-zinc-900/60 hover:bg-zinc-900/20 transition-all group"
                    >
                      <td className="px-5 py-3.5 font-medium text-white">
                        @{lead.igUsername}
                      </td>

                      <td className="px-5 py-3.5">
                        {lead.keyword ? (
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-full font-mono text-[10px]">
                            #{lead.keyword}
                          </Badge>
                        ) : (
                          <span className="text-zinc-600 text-xs">N/A</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-zinc-300 max-w-[200px] truncate" title={lead.comment}>
                        {lead.comment || <span className="text-zinc-600 italic">No comment recorded</span>}
                      </td>

                      <td className="px-5 py-3.5 text-zinc-400 font-medium">
                        {campaignName}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {lead.tags && lead.tags.length > 0 ? (
                            lead.tags.slice(0, 2).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] py-0 px-2 rounded">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-zinc-700 text-xs">-</span>
                          )}
                          {lead.tags && lead.tags.length > 2 && (
                            <span className="text-[10px] text-zinc-500">+{lead.tags.length - 2}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge className={`rounded-full px-2.5 py-0.5 border text-xs font-semibold ${statusColor}`}>
                          {lead.status || "new"}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-right text-xs text-muted-foreground">
                        {new Date(lead.updatedAt || lead.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleOpenEditModal(lead)}
                          className="h-7 w-7 rounded-md bg-zinc-900 border border-zinc-800 hover:border-primary/40 hover:bg-primary/10 flex items-center justify-center text-zinc-400 hover:text-primary transition-all cursor-pointer inline-flex align-middle"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Glassmorphic CRM Edit Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-card border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950/95"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-zinc-900/20">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg text-white">Manage CRM Lead</h3>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Username and Camapign Info */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Instagram Handle</span>
                    <p className="text-sm font-semibold text-white mt-0.5">@{selectedLead.igUsername}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Matched Keyword</span>
                    <p className="text-sm font-semibold text-primary mt-0.5 font-mono">#{selectedLead.keyword || "N/A"}</p>
                  </div>
                </div>

                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-zinc-500" />
                    Lead Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-primary text-sm font-medium"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="replied">Replied Back</option>
                    <option value="won">Won (Converted)</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                {/* Tags input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
                    <TagIcon className="h-3.5 w-3.5 text-zinc-500" />
                    Lead Tags
                  </label>
                  <Input
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="e.g. VIP, high-intent, discount-requested (comma separated)"
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary rounded-lg text-sm h-10"
                  />
                  <p className="text-[10px] text-zinc-500">Separate multiple tags with commas.</p>
                </div>

                {/* Notes input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
                    <StickyNote className="h-3.5 w-3.5 text-zinc-500" />
                    CRM Notes
                  </label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add details, links, or custom notes about this lead..."
                    className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-primary text-sm placeholder:text-zinc-600 resize-none font-sans"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800/80 bg-zinc-900/20">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLead(null)}
                  className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white rounded-xl text-xs h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveLead}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs h-9 px-4 flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}