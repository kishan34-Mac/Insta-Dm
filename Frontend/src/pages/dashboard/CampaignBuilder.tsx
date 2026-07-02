import { useState, useEffect, useCallback } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Plus,
  GripVertical,
  X,
  Clock,
  MessageSquare,
  Image as ImageIcon,
  Save,
  Zap,
  Loader2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { campaignApi } from "@/api/campaign";

import { getInstagramAccounts } from "@/api/instagram";

import { useAuth } from "@/store/AuthContext";

type Step = {
  id: string;

  type: "message" | "delay";

  value: string;

  delaySeconds?: number;
};

type InstagramAccount = {
  igUserId: string;

  igUsername: string;
};

export default function CampaignBuilder() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { accessToken } = useAuth();

  const [name, setName] = useState("Untitled campaign");

  const [triggerKeywords, setTriggerKeywords] = useState<string[]>(["guide"]);

  const [kw, setKw] = useState("");

  const [postId, setPostId] = useState("");

  const [instagramAccount, setInstagramAccount] = useState("");

  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);

  const [steps, setSteps] = useState<Step[]>([
    {
      id: "1",

      type: "message",

      value: "Hey! 👋 Thanks for commenting — here's your free guide ↓",
    },

    {
      id: "2",

      type: "delay",

      value: "30",
    },

    {
      id: "3",

      type: "message",

      value: "👉 reel2rev.com/guide",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [saving, setSaving] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);

      const response = await getInstagramAccounts();

      console.log("INSTAGRAM RESPONSE:", response);

      const accountsData = response?.data || [];

      setAccounts(accountsData);

      // Only auto-select if we aren't editing a campaign (which has its own value)
      if (accountsData.length > 0 && !id) {
        setInstagramAccount(accountsData[0].igUserId);
      }
    } catch (error) {
      console.error("Instagram fetch error:", error);

      toast.error("Failed to load Instagram accounts");
    } finally {
      setLoadingAccounts(false);
    }
  }, [id]);

  const loadCampaign = useCallback(async () => {
    if (!id) return;

    setLoading(true);

    try {
      const response = await campaignApi.getOne(id);

      const c = response.data;

      setName(c.name);

      setTriggerKeywords(c.triggerKeywords || c.keywords || []);

      setPostId(c.postId || "");

      setInstagramAccount(c.instagramAccount || "");

      setSteps(
        c.steps.map((s: { type: "message" | "delay"; value: string; delaySeconds?: number }, i: number) => ({
          id: (i + 1).toString(),

          type: s.type,

          value: s.type === "delay" ? String(s.delaySeconds || 0) : s.value,
        })),
      );
    } catch (error) {
      console.error(error);

      toast.error("Failed to load campaign");

      navigate("/dashboard/campaigns");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadAccounts();

    if (id && accessToken) {
      loadCampaign();
    }
  }, [id, accessToken, loadCampaign, loadAccounts]);

  const handleSave = async (status: "draft" | "active" = "active") => {
    if (!accessToken) return;

    if (triggerKeywords.length === 0) {
      toast.error("Add at least one keyword");

      return;
    }

    if (!instagramAccount) {
      toast.error("Select Instagram account");

      return;
    }

    setSaving(true);

    const firstMsg = steps.find((s) => s.type === "message" && s.value.trim())?.value || "";

    const campaignData = {
      name,

      instagramAccount,

      triggerKeywords,

      postId,

      status,

      triggerType: "keyword",

      autoReplyMessage: firstMsg,

      steps: steps.map((s, index) => ({
        type: s.type,

        value: s.type === "message" ? s.value : "",

        delaySeconds: s.type === "delay" ? Number(s.value) : 0,

        order: index + 1,
      })),
    };

    try {
      if (id) {
        await campaignApi.update(id, campaignData);

        toast.success("Campaign updated!");
      } else {
        await campaignApi.create(campaignData);

        toast.success("Campaign created!");
      }

      navigate("/dashboard/campaigns");
    } catch (error: any) {
      console.error("Save campaign error:", error);

      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save campaign";

      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const addStep = (type: Step["type"]) =>
    setSteps((s) => [
      ...s,

      {
        id: crypto.randomUUID(),

        type,

        value: type === "delay" ? "60" : "",
      },
    ]);

  const removeStep = (id: string) =>
    setSteps((s) => s.filter((x) => x.id !== id));

  const updateStep = (id: string, value: string) =>
    setSteps((s) =>
      s.map((x) =>
        x.id === id
          ? {
              ...x,
              value,
            }
          : x,
      ),
    );

  const addKw = () => {
    const v = kw.trim().toLowerCase();

    if (!v) return;

    if (!triggerKeywords.includes(v)) {
      setTriggerKeywords([...triggerKeywords, v]);
    }

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
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-display text-base sm:text-xl font-bold border-transparent bg-transparent hover:bg-secondary focus:bg-secondary px-2 h-10 max-w-md min-w-0"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save draft
          </Button>

          <Button
            variant="hero"
            size="sm"
            onClick={() => handleSave("active")}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}

            {id ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* LEFT */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />

              <h3 className="font-semibold">Trigger</h3>
            </div>

            {/* ACCOUNT */}
            <div className="mb-5">
              <Label className="text-xs">Instagram Account</Label>

              <select
                value={instagramAccount}
                onChange={(e) => setInstagramAccount(e.target.value)}
                disabled={loadingAccounts || accounts.length === 0}
                className="w-full mt-1.5 h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                {loadingAccounts ? (
                  <option>Loading accounts...</option>
                ) : accounts.length === 0 ? (
                  <option value="">No accounts connected</option>
                ) : (
                  <>
                    <option value="" disabled>
                      Select an account
                    </option>
                    {accounts.map((acc) => (
                      <option key={acc.igUserId} value={acc.igUserId}>
                        @{acc.igUsername}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {accounts.length === 0 && !loadingAccounts && (
                <p className="text-[11px] text-destructive mt-1.5">
                  No Instagram accounts connected. Go to Settings to connect.
                </p>
              )}
            </div>

            {/* KEYWORDS */}
            <Label className="text-xs">When a comment contains</Label>

            <div className="mt-2 flex gap-2">
              <Input
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addKw())
                }
                placeholder="Add keyword"
              />

              <Button variant="secondary" onClick={addKw}>
                Add
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {triggerKeywords.map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/15 border border-primary/20 text-primary"
                >
                  #{k}
                  <button
                    onClick={() =>
                      setTriggerKeywords(triggerKeywords.filter((x) => x !== k))
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* POST */}
            <div className="mt-5">
              <Label className="text-xs">On post / reel</Label>

              <Input
                value={postId}
                onChange={(e) => setPostId(e.target.value)}
                placeholder="https://instagram.com/p/..."
                className="mt-1.5"
              />

              <p className="text-[11px] text-muted-foreground mt-1.5">
                Leave empty to apply to all new posts.
              </p>
            </div>
          </div>

          {/* ADD STEP */}
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3">Add step</h3>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => addStep("message")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>

              <Button variant="outline" onClick={() => addStep("delay")}>
                <Clock className="h-4 w-4 mr-2" />
                Delay
              </Button>

              <Button variant="outline" disabled className="col-span-2">
                <ImageIcon className="h-4 w-4 mr-2" />
                Media (coming soon)
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-1">DM Funnel</h3>

            <p className="text-xs text-muted-foreground mb-5">
              Add delays between messages for natural flow.
            </p>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {steps.map((s, i) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -20,
                    }}
                    className="group rounded-xl border border-border bg-surface-elevated p-4"
                  >
                    <div className="flex items-start gap-3">
                      <button className="mt-1 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                      </button>

                      <div className="h-7 w-7 rounded-md bg-primary/15 text-primary border border-primary/20 flex items-center justify-center text-xs font-semibold shrink-0">
                        {i + 1}
                      </div>

                      <div className="flex-1">
                        {s.type === "message" ? (
                          <>
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                              Message
                            </Label>

                            <Textarea
                              value={s.value}
                              onChange={(e) => updateStep(s.id, e.target.value)}
                              rows={3}
                              className="mt-1.5 resize-none"
                            />
                          </>
                        ) : (
                          <>
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                              Delay (seconds)
                            </Label>

                            <Input
                              type="number"
                              value={s.value}
                              onChange={(e) => updateStep(s.id, e.target.value)}
                              className="mt-1.5 max-w-[180px]"
                            />
                          </>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(s.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 border-dashed"
              onClick={() => addStep("message")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add step
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
