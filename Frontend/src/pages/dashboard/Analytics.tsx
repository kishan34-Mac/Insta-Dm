import { useEffect, useState, useCallback, ComponentType } from "react";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analyticsApi, AnalyticsData } from "@/api/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, MessageSquare, Tag, Award, Users, Share2 } from "lucide-react";
import { PageError } from "@/components/dashboard/page-states";
import { Button } from "@/components/ui/button";






import { motion } from "framer-motion";
import { useRealtimeStore } from "@/store/realtime.store";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
};

export function AnalyticsCard({
  label,
  value,
  description,
  icon: Icon,
  idx,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: ComponentType<{ className?: string }>;
  idx: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="glass-card glass-card-hover p-5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold mt-2 text-foreground">{value}</p>
      <p className="text-[10px] text-zinc-500 mt-1">{description}</p>
    </motion.div>
  );
}

export default function Analytics() {
  const { analytics: data, setAnalytics } = useRealtimeStore();
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await analyticsApi.get();
      if (res.success && res.data) {
        setAnalytics(res.data);
        setError(null);
      }
    } catch (err) {
      console.error("FAILED TO FETCH ANALYTICS:", err);
      setError("Unable to sync database analytics.");
    } finally {
      setLoading(false);
    }
  }, [setAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const summary = data?.summary;

  const cards = [
   
    {
      label: "Total Replies",
      value: summary?.totalReplies ?? 0,
      description: "Direct message replies received",
      icon: MessageSquare,
    },
    {
      label: "Most Successful Keyword",
      value: summary?.mostSuccessfulKeyword || "N/A",
      description: "Keyword matching the most comments",
      icon: Tag,
    },
    {
      label: "Best Performing Campaign",
      value: summary?.bestPerformingCampaign || "N/A",
      description: "Campaign driving the highest engagement",
      icon: Award,
    },
    {
      label: "Total Leads",
      value: summary?.totalLeads ?? 0,
      description: "All time unique leads generated",
      icon: Users,
    },
    {
      label: "Total DMs Dispatched",
      value: summary?.totalSent ?? 0,
      description: "All automated DMs dispatched",
      icon: Share2,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track DMs, keywords, conversion rates, and funnel metrics in real-time.
          </p>
        </div>
        {error ? (
          <div className="max-w-full">
            <PageError
              title="Unable to sync analytics"
              description={error}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={fetchAnalytics}
                >
                  Retry
                </Button>
              }
            />
          </div>
        ) : null}

      </div>


      {/* Analytics Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <AnalyticsCard key={c.label} {...c} idx={i} />
        ))}
      </div>

      {/* Trend Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* DMs vs Conversions */}
        <div className="glass-card glass-card-hover p-6">
          <h3 className="font-semibold text-lg text-foreground">DMs Sent vs Conversions</h3>
          <p className="text-xs text-muted-foreground">Volume & replies over the last 30 days</p>
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend || []}>
                <defs>
                  <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="conv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="d" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  name="DMs Dispatched"
                  dataKey="sent"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#sent)"
                />
                <Area
                  type="monotone"
                  name="Replies Received"
                  dataKey="conv"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  fill="url(#conv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Leads Growth */}
        <div className="glass-card glass-card-hover p-6">
          <h3 className="font-semibold text-lg text-foreground">Daily Leads Generated</h3>
          <p className="text-xs text-muted-foreground">New unique leads captured per day (30 days)</p>
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyLeadsGraph || []}>
                <defs>
                  <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="d" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  name="New Leads"
                  dataKey="leads"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#leadsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekday Conversion Rates and Funnel Analysis */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Engagement Trend by Weekday */}
        <div className="glass-card glass-card-hover p-6">
          <h3 className="font-semibold text-lg text-foreground">Conversion rate</h3>
          <p className="text-xs text-muted-foreground">Historical conversion rate by weekday (%)</p>
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.ctr || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                <Bar dataKey="ctr" name="Conversion Rate" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Drop-off */}
        <div className="glass-card glass-card-hover p-6">
          <h3 className="font-semibold text-lg text-foreground">Funnel drop-off</h3>
          <p className="text-xs text-muted-foreground">Stage-by-stage marketing performance</p>
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Funnel dataKey="value" data={data?.funnel || []} isAnimationActive>
                  <LabelList
                    position="right"
                    fill="hsl(var(--foreground))"
                    stroke="none"
                    dataKey="name"
                    fontSize={11}
                  />
                  <LabelList position="center" fill="white" stroke="none" dataKey="value" fontSize={11} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
