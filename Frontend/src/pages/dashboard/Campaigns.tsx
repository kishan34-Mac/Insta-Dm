import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pause, Play, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { campaignApi, Campaign } from "@/api/campaign";
import { Skeleton } from "@/components/ui/skeleton";
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
      <p className="text-zinc-500 text-xs uppercase font-semibold tracking-wider">
        {label}
      </p>
      <h3 className="text-4xl font-bold mt-1.5 text-white">
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
      const campaignsData = response.data || [];
      setCampaigns(campaignsData);
      setError(null);
    } catch (error) {
      console.error("FETCH CAMPAIGNS ERROR:", error);
      setError("Unable to sync active campaigns.");
    } finally {
      setLoading(false);
    }
  }, [setCampaigns]);

  const toggleCampaign = async (id: string) => {
    try {
      await campaignApi.toggleStatus(id);
      fetchCampaigns();
    } catch (error) {
      console.error("TOGGLE CAMPAIGN ERROR:", error);
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
      <div className="min-h-screen bg-black text-white p-8 space-y-6">
        <div className="flex items-center justify-between mb-8">
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

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Campaigns
          </h1>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base">
            Manage your Instagram automation keyword campaigns 🚀
          </p>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <span className="text-xs px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive-foreground">
              ⚠️ {error}
            </span>
          )}
          <Button
            onClick={() => navigate("/dashboard/campaigns/new")}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-2xl h-12 px-6 font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
            No Campaigns Yet
          </h2>
          <p className="text-zinc-400 mb-8 max-w-sm mx-auto text-sm">
            Launch your first automated keyword response campaign on Instagram comment triggers.
          </p>
          <Button
            onClick={() => navigate("/dashboard/campaigns/new")}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl">
          {campaigns.map((c) => (
            <Card
              key={c._id}
              className="bg-zinc-950/40 border border-zinc-800/80 rounded-3xl overflow-hidden hover:border-zinc-700/80 transition-all shadow-md hover:shadow-lg"
            >
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
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
                          key={index}
                          variant="secondary"
                          className="bg-zinc-900/60 text-zinc-300 border border-zinc-800/80 rounded-full px-3.5 py-0.5 font-mono text-xs"
                        >
                          #{keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => toggleCampaign(c._id)}
                      className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer transition-all"
                      title={c.status === "active" ? "Pause Campaign" : "Activate Campaign"}
                    >
                      {c.status === "active" ? (
                        <Pause className="w-4.5 h-4.5" />
                      ) : (
                        <Play className="w-4.5 h-4.5" />
                      )}
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer transition-all">
                          <MoreVertical className="w-4.5 h-4.5" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="bg-zinc-900 border border-zinc-800 text-white rounded-xl shadow-xl">
                        <DropdownMenuItem asChild className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2">
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

                <div className="border-t border-zinc-900/60 my-6" />

                <div className="grid grid-cols-3 gap-4 sm:gap-8">
                  <Stat
                    label="Sent"
                    value={c.sentCount ?? c.stats?.totalSent ?? 0}
                  />

                  <Stat
                    label="Delivered"
                    value={c.deliveredCount ?? c.stats?.totalDelivered ?? 0}
                  />

                  <Stat
                    label="Replied"
                    value={c.replyCount ?? c.stats?.totalReplied ?? 0}
                  />
                </div>

                <div className="mt-6 text-xs text-zinc-500 flex items-center gap-1.5">
                  <span>Created:</span>
                  <span className="text-zinc-400 font-medium">
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