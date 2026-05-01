import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, MessageSquare, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const stats = [
  { label: "Total DMs Sent", value: "48,219", delta: "+12.4%", up: true, icon: MessageSquare },
  { label: "Leads Generated", value: "3,184", delta: "+8.2%", up: true, icon: Users },
  { label: "Conversion Rate", value: "6.6%", delta: "+1.1%", up: true, icon: TrendingUp },
  { label: "Click-through Rate", value: "24.3%", delta: "-0.4%", up: false, icon: MousePointerClick },
];

const dmSeries = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  dms: 1200 + Math.round(Math.sin(i / 2) * 400 + Math.random() * 600 + i * 80),
  leads: 120 + Math.round(Math.cos(i / 2) * 30 + Math.random() * 60 + i * 6),
}));

const campaignBars = [
  { name: "Launch Reel", v: 1240 }, { name: "Black Friday", v: 980 },
  { name: "Free Guide", v: 1820 }, { name: "Webinar", v: 540 },
  { name: "Drop #4", v: 1380 },
];

export function StatCard({ label, value, delta, up, icon: Icon, idx }: typeof stats[number] & { idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
      className="glass-card p-5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className={cn(
          "inline-flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full",
          up ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
        )}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta}
        </span>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold mt-1">{value}</p>
    </motion.div>
  );
}

export default function Overview() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Welcome back, Jane 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">Here's how your campaigns performed in the last 14 days.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} idx={i} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">DMs vs Leads</h3>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dmSeries}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="dms" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="leads" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold">Top campaigns</h3>
          <p className="text-xs text-muted-foreground">By DMs sent</p>
          <div className="h-72 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignBars} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="v" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Recent activity</h3>
        <ul className="space-y-3">
          {[
            { who: "@maria.studio", what: "matched 'price' on Reel #142", when: "2m ago" },
            { who: "@johnny.designs", what: "matched 'guide' on Reel #138", when: "12m ago" },
            { who: "@nova.fit", what: "matched 'link' on Reel #140", when: "28m ago" },
            { who: "@coffeebar.id", what: "matched 'menu' on Reel #141", when: "1h ago" },
          ].map((r) => (
            <li key={r.who} className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p><span className="font-medium">{r.who}</span> <span className="text-muted-foreground">{r.what}</span></p>
              </div>
              <span className="text-xs text-muted-foreground">{r.when}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
