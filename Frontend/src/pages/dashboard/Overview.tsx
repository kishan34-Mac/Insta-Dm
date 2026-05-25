import { useEffect, useState, useCallback, ComponentType } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, MessageSquare, TrendingUp, Users, FolderKanban, PlaySquare } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { overviewApi, OverviewData } from "@/api/overview";
import { useAuth } from "@/store/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimeStore } from "@/store/realtime.store";

export function StatCard({
  label,
  value,
  icon: Icon,
  idx,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  idx: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="glass-card p-5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="inline-flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full bg-success/15 text-success">
          <ArrowUpRight className="h-3 w-3" />
          Live
        </span>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold mt-1">{value}</p>
    </motion.div>
  );
}

export default function Overview() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  const { overview: data, setOverview } = useRealtimeStore();
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const fetchOverviewData = useCallback(async () => {
    try {
      const res = await overviewApi.get();
      if (res.success && res.data) {
        setOverview(res.data);
        setError(null);
      }
    } catch (err) {
      console.error("FAILED TO FETCH OVERVIEW:", err);
      setError("Unable to sync overview dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [setOverview]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const stats = [
    {
      label: "Total Campaigns",
      value: data?.stats?.totalCampaigns ?? 0,
      icon: FolderKanban,
    },
    {
      label: "Active Campaigns",
      value: data?.stats?.activeCampaigns ?? 0,
      icon: PlaySquare,
    },
    {
      label: "Leads Generated",
      value: data?.stats?.totalLeads ?? 0,
      icon: Users,
    },
    {
      label: "Messages Sent",
      value: data?.stats?.totalSent ?? 0,
      icon: MessageSquare,
    },
    {
      label: "Reply Rate",
      value: `${data?.stats?.replyRate ?? 0}%`,
      icon: TrendingUp,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Welcome back, {firstName} 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time analytics and Instagram keyword automation campaign tracker.
          </p>
        </div>
        {error && (
          <span className="text-xs px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive-foreground">
            ⚠️ {error}
          </span>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} idx={i} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-white">DMs vs Leads</h3>
              <p className="text-xs text-muted-foreground">Activity distribution over last 14 days</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts?.dmSeries || []}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  name="DMs Sent"
                  dataKey="dms"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
                <Area
                  type="monotone"
                  name="Leads Generated"
                  dataKey="leads"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#g2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-lg text-white">Top campaigns</h3>
          <p className="text-xs text-muted-foreground">Ranked by messages sent</p>
          <div className="h-72 mt-2">
            {!data?.charts?.campaignBars || data.charts.campaignBars.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No campaign data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.campaignBars} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="v" name="DMs Sent" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed Section */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-lg text-white mb-4">Recent activity</h3>
        {!data?.recentActivities || data.recentActivities.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Waiting for Instagram comments/DMs triggers to log events...
          </div>
        ) : (
          <ul className="space-y-4">
            {data.recentActivities.map((act) => {
              let iconColor = "from-primary to-accent";
              if (act.type === "reply") iconColor = "from-emerald-500 to-teal-400";
              if (act.type === "campaign") iconColor = "from-violet-500 to-fuchsia-500";

              return (
                <li key={act.id} className="flex items-center gap-3 text-sm">
                  <div
                    className={`h-8 w-8 rounded-full bg-gradient-to-br ${iconColor} shrink-0 flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {act.who.replace(/[@"']/g, "").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200">
                      <span className="font-medium text-white">{act.who}</span>{" "}
                      <span className="text-muted-foreground">{act.what}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{act.when}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
