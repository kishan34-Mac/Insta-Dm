import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pause, Play, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PageEmpty,
  PageError,
} from "@/components/dashboard/page-states";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { campaignApi } from "@/api/campaign";
import { useRealtimeStore } from "@/store/realtime.store";


const Stat = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => {
  return (
    <div>
          <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">
        {label}
      </p>
      <h3 className="text-4xl font-bold mt-1.5 text-foreground">
        {value}
      </h3>
    </div>
  );
};

export default function Campaigns() {
  const navigate = useNavigate();
  const { campaigns, setCampaigns } = useRealtimeStore();
  const [loading, setLoading] = useState(campaigns.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await campaignApi.getAll();
      const campaignsData = response.data?.results || (Array.isArray(response.data) ? response.data : []);
      setCampaigns(campaignsData);
      setError(null);
    } catch (error) {
      console.error("FETCH CAMPAIGNS ERROR:", error);
      setError("Unable to sync active campaigns.");
    } finally {
      setLoading(false);
    }
  }, [setCampaigns]);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleCampaign = async (id: string) => {
    setTogglingId(id);
    try {
      await campaignApi.toggleStatus(id);
      fetchCampaigns();
    } catch (error) {
      console.error("TOGGLE CAMPAIGN ERROR:", error);
    } finally {
      setTogglingId(null);
    }
  };


  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await campaignApi.delete(id);
      fetchCampaigns();
    } catch (error) {
      console.error("DELETE CAMPAIGN ERROR:", error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-12 w-36 rounded-2xl" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <PageError
        title="Unable to sync active campaigns"
        description={error}
        action={
          <Button variant="outline" className="mt-2" onClick={fetchCampaigns}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="min-w-0 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Campaigns
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your Instagram automation keyword campaigns 🚀
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/dashboard/campaigns/new")}
            className="rounded-2xl h-11 px-5 font-semibold"
            variant="hero"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Campaign metrics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card glass-card-hover p-4 border border-border/60">
          <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Total Campaigns</p>
          <h3 className="font-display text-2xl font-bold mt-1.5 text-foreground">{campaigns.length}</h3>
        </div>
        <div className="glass-card glass-card-hover p-4 border border-border/60">
          <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Active</p>
          <h3 className="font-display text-2xl font-bold mt-1.5 text-foreground">{campaigns.filter((c) => c.status === "active").length}</h3>
        </div>
            <div className="glass-card glass-card-hover p-4 border border-border/60">
          <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Leads Captured</p>
          <h3 className="font-display text-2xl font-bold mt-1.5 text-foreground">{campaigns.reduce((sum, c) => sum + (c.stats?.totalLeads ?? 0), 0)}</h3>
        </div>
        <div className="glass-card glass-card-hover p-4 border border-border/60">
          <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Messages Sent</p>
          <h3 className="font-display text-2xl font-bold mt-1.5 text-foreground">{campaigns.reduce((sum, c) => sum + (c.stats?.totalSent ?? 0), 0)}</h3>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="max-w-3xl mx-auto rounded-2xl border border-border/80 bg-surface-elevated/60 p-6 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-5">
            {/* Illustration */}
            <div className="relative w-full max-w-md">
              <div className="glass-card rounded-3xl border border-border/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-orange-400 flex items-center justify-center shadow-glow-accent">
                      <span className="text-white font-bold">IG</span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Instagram</p>
                      <p className="font-semibold">Comment → Lead</p>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-secondary/60 border border-border/80 flex items-center justify-center">
                    <span className="text-primary font-bold">⚡</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-primary/20" />

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 rounded-2xl border border-border/80 bg-background/40 p-3">
                        <p className="text-xs text-muted-foreground">New comment</p>
                        <p className="text-sm font-semibold mt-1">“Interested?”</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <span className="text-primary">→</span>
                        </div>
                      </div>
                      <div className="flex-1 rounded-2xl border border-border/80 bg-background/40 p-3">
                        <p className="text-xs text-muted-foreground">Qualified lead</p>
                        <p className="text-sm font-semibold mt-1">Captured</p>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Under 2 minutes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                🚀 Launch your first campaign
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Turn Instagram comments into qualified leads in less than 2 minutes.
              </p>
            </div>

            <Button
              onClick={() => navigate("/dashboard/campaigns/new")}
              variant="hero"
              className="rounded-2xl px-6 h-11"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      ) : (

        <div className="space-y-6 max-w-5xl">


          {campaigns.map((c) => (
            <Card
              key={c._id}
              className="glass-card glass-card-hover border border-border/80 rounded-3xl overflow-hidden hover:border-primary/40 transition-all"
            >
              <CardContent className="p-8">

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <h2 className="text-2xl sm:text-3xl font-bold">

                        {c.name}
                      </h2>
                      <Badge
                        className={`rounded-full px-3.5 py-0.5 text-xs font-semibold border ${
                          c.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        }`}
                      >
                        {c.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2.5 mt-5">
                      {(c.triggerKeywords || c.keywords || []).map((keyword, index) => (
                        <Badge
                          key={`${keyword}-${index}`}
                          variant="secondary"
                          className="bg-secondary/50 text-muted-foreground border-border rounded-full px-3.5 py-0.5 font-mono text-xs"
                        >
                          #{keyword}
                        </Badge>
                      ))}
                    </div>

                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                      <button
                        aria-label={
                          c.status === "active"
                            ? "Pause campaign"
                            : "Activate campaign"
                        }
                        onClick={() => toggleCampaign(c._id)}
                        disabled={togglingId === c._id}
                        className="h-9 w-9 rounded-xl border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center text-foreground/70 hover:text-foreground cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          c.status === "active"
                            ? "Pause Campaign"
                            : "Activate Campaign"
                        }
                      >


                      {c.status === "active" ? (
                        <Pause className="w-4.5 h-4.5" />
                      ) : (
                        <Play className="w-4.5 h-4.5" />
                      )}
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-label="Campaign actions"
                          className="h-9 w-9 rounded-xl border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center text-foreground/70 hover:text-foreground cursor-pointer transition-all"
                        >

                          <MoreVertical className="w-4.5 h-4.5" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="bg-secondary/80 border border-border text-foreground rounded-xl shadow-xl">
                        <DropdownMenuItem asChild className="focus:bg-secondary focus:text-foreground cursor-pointer py-2">
                          <Link to={`/dashboard/campaigns/edit/${c._id}`}>
                            Edit Campaign
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDeleteCampaign(c._id)}
                          className="text-red-400 focus:bg-red-950/20 focus:text-red-300 cursor-pointer py-2"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Campaign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="border-t border-border/60 my-6" />

                <div className="grid grid-cols-3 gap-4 sm:gap-8">
                      <Stat
                    label="Sent"
                    value={c.stats?.totalSent ?? 0}
                  />

                  <Stat
                    label="Delivered"
                    value={c.stats?.totalDelivered ?? 0}
                  />

                  <Stat
                    label="Replied"
                    value={c.stats?.totalReplied ?? 0}
                  />
                </div>

                <div className="mt-6 text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>Created:</span>
                  <span className="text-foreground/70 font-medium">
                    {new Date(c.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}