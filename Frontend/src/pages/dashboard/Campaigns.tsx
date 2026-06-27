import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pause, Play, MoreVertical, Trash2, Send, CheckCircle2 } from "lucide-react";
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
  const isSent = label.toLowerCase() === "sent";
  const Icon = isSent ? Send : CheckCircle2;
  const colorClass = isSent ? "text-blue-400" : "text-emerald-400";

  return (
    <div className="glass-card bg-secondary/20 p-4 sm:p-5 border border-border/50 rounded-2xl min-w-[140px] flex-1 relative overflow-hidden group hover:border-border/80 transition-all duration-300">
      <div className="absolute -right-4 -top-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none">
        <Icon className={`w-24 h-24 ${colorClass}`} />
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${colorClass}`} />
          <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">
            {label}
          </p>
        </div>
        <h3 className="font-display text-4xl font-bold text-foreground tracking-tight">
          {value}
        </h3>
      </div>
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
        <div className="max-w-3xl mx-auto rounded-2xl border border-border/80 bg-surface-elevated/60 p-3 md:p-6 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-5">
            {/* Illustration */}
            <div className="relative w-full max-w-md">
              <div className="glass-card rounded-3xl border border-border/80 p-3 md:p-5">
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
                    <span className="text-primary font-bold">
                      <svg
                        fill="#fff"
                        width="20px"
                        height="20px"
                        viewBox="0 0 24 24"
                        id="thunder"
                        data-name="Line Color"
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon line-color"
                      >
                        <path
                          id="primary"
                          d="M17.76,10.63,9,21l2.14-8H7.05a1,1,0,0,1-1-1.36l3.23-8a1.05,1.05,0,0,1,1-.64h4.34a1,1,0,0,1,1,1.36L13.7,9H17A1,1,0,0,1,17.76,10.63Z"
                          style={{
                            fill: "none",
                            stroke: "#fff",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                          }}
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center">
                  <div className="relative w-full">
                    {/* <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-primary/20" /> */}

                    <div className="flex items-center justify-between gap-2 md:gap-3 flex-wrap">
                      <div className="flex-1 rounded-2xl border border-border/80 bg-background/40 p-3">
                        <p className="text-xs text-muted-foreground">New comment</p>
                        <p className="text-sm font-semibold mt-1">“Interested?”</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <span className="text-primary">
                          <svg
                            id="Layer_1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            x="0px"
                            y="0px"
                            viewBox="0 0 512.002 512.002"
                            width="20px"
                            height="20px"
                            xmlSpace="preserve"
                            fill="currentColor"
                          >
                            <g>
                              <g>
                                <path d="M501.819,204.908c-0.054-0.032-0.109-0.065-0.166-0.096L288.161,83.199c-6.55-3.893-14.416-3.978-21.058-0.221 c-6.672,3.775-10.654,10.606-10.654,18.271v43.804c-0.979,0.147-1.955,0.293-2.925,0.438 c-22.733,3.219-45.696,8.538-68.253,15.807c-4.356,1.404-6.75,6.073-5.346,10.428c1.403,4.355,6.076,6.746,10.427,5.345 c21.661-6.98,43.698-12.084,65.559-15.182c3.345-0.499,6.692-0.998,10.037-1.493c4.063-0.601,7.074-4.089,7.074-8.196v-50.951 c0-2.327,1.569-3.466,2.244-3.847c0.674-0.383,2.459-1.14,4.453,0.057c0.054,0.032,0.109,0.065,0.166,0.096l213.463,121.598 c1.877,1.166,2.082,3.007,2.082,3.752c0,0.745-0.205,2.587-2.082,3.752L279.883,348.253c-0.055,0.031-0.11,0.063-0.166,0.096 c-1.994,1.2-3.781,0.44-4.453,0.059c-0.674-0.382-2.244-1.521-2.244-3.848V293.61c0-4.03-2.901-7.477-6.873-8.164l-3.305-0.573 c-43.543-7.538-78.476-7.374-109.936,0.514c-15.79,3.959-30.708,10.254-44.34,18.709c-3.889,2.412-5.086,7.52-2.675,11.409 c2.413,3.889,7.522,5.086,11.409,2.674c12.174-7.551,25.509-13.175,39.636-16.717c28.293-7.096,59.994-7.379,99.511-0.863v43.962 c0,7.665,3.984,14.496,10.655,18.271c3.254,1.841,6.801,2.76,10.344,2.76c3.688,0,7.371-0.995,10.715-2.981l213.491-121.612 c0.055-0.032,0.11-0.064,0.166-0.097c6.376-3.83,10.183-10.557,10.183-17.994C512.002,215.466,508.194,208.738,501.819,204.908z" />
                              </g>
                            </g>
                            <g>
                              <g>
                                <path d="M162.262,178.28c-1.827-4.195-6.71-6.114-10.905-4.286c-44.081,19.203-80.76,47.148-106.073,80.813 C13.452,297.144-2.9,352.795,0.424,407.495l0.011,0.178c0.867,13.695,12.061,24.11,25.677,24.11c0.323,0,0.647-0.006,0.972-0.018 l0.602-0.022c11.425-0.413,21.326-8.417,24.075-19.456l0.075-0.298c5.227-20.055,13.569-38.526,24.794-54.903 c4.765-6.953,10.178-13.482,16.089-19.407c3.231-3.239,3.226-8.486-0.014-11.717c-3.239-3.231-8.486-3.226-11.717,0.014 c-6.624,6.641-12.689,13.956-18.026,21.743c-12.312,17.96-21.449,38.178-27.176,60.15l-0.104,0.409 c-0.977,3.919-4.511,6.759-8.614,6.907l-0.577,0.021c-4.936,0.169-9.208-3.669-9.516-8.552l-0.01-0.167 c-3.089-50.827,12.062-102.481,41.565-141.72c23.598-31.383,57.985-57.517,99.446-75.58 C162.171,187.358,164.09,182.476,162.262,178.28z" />
                              </g>
                            </g>
                          </svg>
                          </span>
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

            <div className="max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
              <svg
                fill="currentColor"
                width="20px"
                height="20px"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M209.68 883.264c-20.112 41.807-32.802 69.666-144.689 73.73 3.216-107.968 23.792-119.552 64.992-140.08 17.296-8.624 38.832-19.344 62.113-37.248l-38.96-49.744c-18.4 14.128-35.329 21.568-51.697 29.712C32.8 793.858.45 827.569.45 988.289l.543 32.704 31.456-.704c169.632 0 201.328-38.32 233.104-104.32 6.96-14.464 10.832-24.24 22.56-43.729l-47.456-43.104c-14.224 19.408-23.104 37.872-30.976 54.128zm495.279-694.607c-70.768 0-128.352 57.583-128.352 128.335 0 70.784 57.6 128.353 128.352 128.353s128.336-57.584 128.336-128.352c0-70.752-57.6-128.336-128.336-128.336zm0 192.415c-35.328 0-64.08-28.752-64.08-64.08 0-35.313 28.752-64.08 64.08-64.08s64.08 28.767 64.08 64.08c-.016 35.344-28.752 64.08-64.08 64.08zm318.821-351.76c-.976-15.968-13.63-28.771-29.598-29.955 0 0-179.088-13.056-351.376 51.28-62.944 23.504-114.752 60.737-163.104 117.137-40.32 47.025-80.385 132.032-115.745 202.608-13.664 27.248-26.72 53.313-37.792 73.217H148.15a32.003 32.003 0 0 0-23.936 10.768L6.917 581.503A31.993 31.993 0 0 0 .388 612.51c3.44 10.785 12.32 18.945 23.329 21.44l190.944 43.665c13.007 16.064 34.687 40.097 69.376 78.593l72.335 80.192 38.945 164.72a31.984 31.984 0 0 0 21.231 23.056c3.233 1.024 6.576 1.568 9.904 1.568a31.95 31.95 0 0 0 20.832-7.712l118.56-117.936a31.981 31.981 0 0 0 11.184-24.288v-165.12c15.936-9.904 44.191-25.152 70.783-40.032 72.464-40.496 180.624-90.912 225.472-130.784 63.153-56.128 86.16-97.28 108.752-158.112 53.712-144.688 42.288-344.031 41.744-352.447zM922.001 359.469c-19.712 53.072-37.568 84.83-91.248 132.558-39.664 35.232-148.128 85.824-214.192 122.769-49.312 27.568-78.848 43.664-91.792 54.256a31.949 31.949 0 0 0-11.76 24.784v167.248l-67.52 74.193-28.752-121.6a31.949 31.949 0 0 0-7.393-14.064c-58.847-65.216-147.743-163.808-154.56-171.632a32.017 32.017 0 0 0-17.568-10.848L90.624 583.597l71.904-76H344.56a31.988 31.988 0 0 0 27.264-15.248c14.08-22.928 30.416-55.536 49.344-93.296 32.048-63.952 71.92-148.544 107.12-189.632 41.584-48.528 83.824-79.009 136.896-98.848C783.28 66.445 905.152 61.805 960.864 62.22c1.04 59.008-1.184 195.824-38.863 297.248z" />
              </svg>
                Launch your first campaign
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

                <div className="flex flex-wrap items-center gap-4">
                  <Stat
                    label="Sent"
                    value={c.stats?.totalSent ?? 0}
                  />

                  <Stat
                    label="Delivered"
                    value={c.stats?.totalDelivered ?? 0}
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