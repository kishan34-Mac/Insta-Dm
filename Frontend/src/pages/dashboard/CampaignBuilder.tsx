import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, GripVertical, X, Clock, MessageSquare, Image as ImageIcon, Save, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { campaignApi, type CampaignStep } from "@/api/campaign";
import { useAuth } from "@/store/AuthContext";

type Step = { id: string; type: "message" | "delay"; value: string };

export default function CampaignBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  
  const [name, setName] = useState("Untitled campaign");
  const [keywords, setKeywords] = useState<string[]>(["guide"]);
  const [kw, setKw] = useState("");
  const [postId, setPostId] = useState("");
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", type: "message", value: "Hey! 👋 Thanks for commenting — here's your free guide ↓" },
    { id: "2", type: "delay", value: "30" },
    { id: "3", type: "message", value: "👉 reel2rev.com/guide" },
  ]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && accessToken) {
      loadCampaign();
    }
  }, [id, accessToken]);

  const loadCampaign = async () => {
    if (!accessToken || !id) return;
    setLoading(true);
    try {
      const response = await campaignApi.getById(id, accessToken);
      const c = response.data;
      setName(c.name);
      setKeywords(c.keywords);
      setPostId(c.postId || "");
      setSteps(c.steps.map((s, i) => ({
        id: (i + 1).toString(),
        type: s.type,
        value: s.value
      })));
    } catch (error) {
      toast.error("Failed to load campaign");
      navigate("/dashboard/campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status: "draft" | "active" = "active") => {
    if (!accessToken) return;
    if (keywords.length === 0) {
      toast.error("Add at least one keyword");
      return;
    }
    
    setSaving(true);
    const campaignData = {
      name,
      keywords,
      postId,
      status,
      steps: steps.map(s => ({ type: s.type, value: s.value })),
      triggerType: "keyword" as const,
    };

    try {
      if (id) {
        await campaignApi.update(id, campaignData, accessToken);
        toast.success("Campaign updated!");
      } else {
        await campaignApi.create(campaignData, accessToken);
        toast.success("Campaign created!");
      }
      navigate("/dashboard/campaigns");
    } catch (error) {
      toast.error("Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  const addStep = (type: Step["type"]) =>
    setSteps((s) => [...s, { id: crypto.randomUUID(), type, value: type === "delay" ? "60" : "" }]);
  const removeStep = (id: string) => setSteps((s) => s.filter((x) => x.id !== id));
  const updateStep = (id: string, value: string) =>
    setSteps((s) => s.map((x) => (x.id === id ? { ...x, value } : x)));

  const addKw = () => {
    const v = kw.trim().toLowerCase();
    if (!v) return;
    if (!keywords.includes(v)) setKeywords([...keywords, v]);
    setKw("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Button variant="ghost" size="icon" asChild><Link to="/dashboard/campaigns"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <Input value={name} onChange={(e) => setName(e.target.value)}
                 className="font-display text-base sm:text-xl font-bold border-transparent bg-transparent hover:bg-secondary focus:bg-secondary px-2 h-10 max-w-md min-w-0" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => handleSave("draft")} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save draft
          </Button>
          <Button variant="hero" size="sm" onClick={() => handleSave("active")} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            <span className="hidden sm:inline">{id ? "Update" : "Publish"}</span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: triggers */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Trigger</h3>
            </div>
            <Label className="text-xs">When a comment contains</Label>
            <div className="mt-2 flex gap-2">
              <Input value={kw} onChange={(e) => setKw(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKw())}
                     placeholder="Add keyword and press Enter" />
              <Button variant="secondary" onClick={addKw}>Add</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {keywords.map((k) => (
                <span key={k} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/15 border border-primary/20 text-primary">
                  #{k}
                  <button onClick={() => setKeywords(keywords.filter((x) => x !== k))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="mt-5">
              <Label className="text-xs">On post / reel</Label>
              <Input value={postId} onChange={(e) => setPostId(e.target.value)} placeholder="https://instagram.com/p/…" className="mt-1.5" />
              <p className="text-[11px] text-muted-foreground mt-1.5">Leave empty to apply to all new posts.</p>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3">Add step</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => addStep("message")} className="justify-start">
                <MessageSquare className="h-4 w-4" /> Message
              </Button>
              <Button variant="outline" onClick={() => addStep("delay")} className="justify-start">
                <Clock className="h-4 w-4" /> Delay
              </Button>
              <Button variant="outline" disabled className="justify-start col-span-2">
                <ImageIcon className="h-4 w-4" /> Media (coming soon)
              </Button>
            </div>
          </div>
        </div>

        {/* Right: funnel builder */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-1">DM Funnel</h3>
            <p className="text-xs text-muted-foreground mb-5">Drag to reorder. Add delays between messages for natural flow.</p>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {steps.map((s, i) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="group relative rounded-xl border border-border bg-surface-elevated p-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button className="mt-1 text-muted-foreground hover:text-foreground cursor-grab">
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <div className="h-7 w-7 rounded-md bg-primary/15 text-primary border border-primary/20 flex items-center justify-center text-xs font-semibold shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        {s.type === "message" ? (
                          <>
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Message</Label>
                            <Textarea
                              value={s.value} onChange={(e) => updateStep(s.id, e.target.value)}
                              placeholder="Write your DM…" rows={2}
                              className="mt-1.5 resize-none bg-background"
                            />
                          </>
                        ) : (
                          <>
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Delay (seconds)</Label>
                            <Input
                              type="number" value={s.value} onChange={(e) => updateStep(s.id, e.target.value)}
                              className="mt-1.5 max-w-[160px] bg-background"
                            />
                          </>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"
                              onClick={() => removeStep(s.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Button variant="outline" className="w-full mt-4 border-dashed" onClick={() => addStep("message")}>
              <Plus className="h-4 w-4" /> Add step
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
