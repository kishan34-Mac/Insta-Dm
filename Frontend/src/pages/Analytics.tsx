import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer 
} from "recharts";
import { 
  BarChart3, TrendingUp, Users, MessageSquare, Clock, 
  Percent, ArrowUpRight, Zap, Target
} from "lucide-react";

// Mock Data for Charts
const conversionData = [
  { day: "Mon", impressions: 1200, clicks: 420, dms: 280 },
  { day: "Tue", impressions: 1400, clicks: 510, dms: 340 },
  { day: "Wed", impressions: 1600, clicks: 580, dms: 410 },
  { day: "Thu", impressions: 1900, clicks: 680, dms: 490 },
  { day: "Fri", impressions: 2200, clicks: 820, dms: 610 },
  { day: "Sat", impressions: 2500, clicks: 940, dms: 720 },
  { day: "Sun", impressions: 2700, clicks: 1050, dms: 840 },
];

const leadGrowthData = [
  { week: "W1", leads: 150 },
  { week: "W2", leads: 320 },
  { week: "W3", leads: 480 },
  { week: "W4", leads: 690 },
  { week: "W5", leads: 910 },
  { week: "W6", leads: 1150 },
  { week: "W7", leads: 1420 },
];

const channelShareData = [
  { name: "Post Comments", value: 550, color: "#3ecf8e" },
  { name: "Reels Interactions", value: 380, color: "#24b47e" },
  { name: "Direct Story Replies", value: 210, color: "#1f9b6b" },
  { name: "Mentions Trigger", value: 120, color: "#707070" },
];

export default function AnalyticsPage() {
  useSEO({
    title: "Campaign Analytics - Performance Metrics",
    description: "Review conversions, response rates, DM growth trends, and automated campaign clicks. DMPilot provides direct metrics for your Instagram automation dashboard.",
    keywords: "instagram statistics, campaign reporting, lead charts, conversion rates, response metrics"
  });

  const stats = [
    {
      title: "Response Rate",
      value: "99.8%",
      change: "+0.1% vs last week",
      icon: <Clock className="h-4 w-4 text-primary" />
    },
    {
      title: "Engagement Growth",
      value: "+14.2%",
      change: "+2.4% vs last week",
      icon: <Percent className="h-4 w-4 text-primary" />
    },
    {
      title: "Total Leads Generated",
      value: "1,420",
      change: "+312 new leads",
      icon: <Users className="h-4 w-4 text-primary" />
    },
    {
      title: "DM Funnel Conversions",
      value: "32.4%",
      change: "+1.8% vs last month",
      icon: <Target className="h-4 w-4 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Analytics Hero */}
        <section className="relative overflow-hidden py-16 text-center">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="container relative px-4 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 border border-primary/20">
                <BarChart3 className="h-3.5 w-3.5" /> High Precision Statistics
              </span>
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6">
                Data-Driven <span className="text-primary">Social ROI</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Monitor your Instagram funnel efficiency, lead statistics, conversion charts, and conversation speed in real-time.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Preview Metrics */}
        <section className="py-8">
          <div className="container px-4 mx-auto">
            {/* Quick Metrics Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                >
                  <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                      <div className="p-1.5 rounded-sm bg-secondary border">{stat.icon}</div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-[10px] text-primary flex items-center gap-1 mt-1 font-medium">
                        <ArrowUpRight className="h-3 w-3" /> {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Graphs Grid */}
            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              {/* Campaign & DM Conversion AreaChart */}
              <Card className="lg:col-span-2 border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Funnel Conversions Trend</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Daily comparison of Impressions, Link Clicks, and Delivered DMs</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDms" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          fontSize: "12px",
                          borderRadius: "6px"
                        }} 
                      />
                      <Area type="monotone" dataKey="impressions" stroke="#707070" fill="transparent" strokeWidth={1.5} />
                      <Area type="monotone" dataKey="clicks" stroke="#24b47e" fill="transparent" strokeWidth={1.5} />
                      <Area type="monotone" dataKey="dms" name="Automated DMs" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorDms)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Channel Share PieChart */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Interactions by channel</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Where users initiate automations</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex flex-col justify-between">
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={channelShareData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {channelShareData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            borderColor: "hsl(var(--border))",
                            fontSize: "12px",
                            borderRadius: "6px"
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {channelShareData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{item.value} triggers</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Graph Grid */}
            <div className="grid gap-6 md:grid-cols-2 mb-12">
              {/* Lead Growth BarChart */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Lead Capture Growth</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Accumulated leads stored in database</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          fontSize: "12px",
                          borderRadius: "6px"
                        }} 
                      />
                      <Bar dataKey="leads" name="Leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Conversion Performance Over Time */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Conversion Rate Efficiency</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Percentage of users converting from DM opening to link click</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          fontSize: "12px",
                          borderRadius: "6px"
                        }} 
                      />
                      <Line type="monotone" dataKey="dms" stroke="hsl(var(--primary))" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Real-time Ticker Metrics */}
        <section className="py-12 bg-secondary/30 border-y border-border">
          <div className="container px-4 mx-auto max-w-4xl text-center">
            <h2 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Real-time Global System Activity
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="bg-card border p-4 rounded-lg shadow-sm">
                <span className="text-xs text-muted-foreground block mb-1">Queue Sync Processing</span>
                <span className="text-2xl font-bold text-foreground">0.08s</span>
              </div>
              <div className="bg-card border p-4 rounded-lg shadow-sm">
                <span className="text-xs text-muted-foreground block mb-1">Meta API Connectivity</span>
                <span className="text-2xl font-bold text-primary">99.99%</span>
              </div>
              <div className="bg-card border p-4 rounded-lg shadow-sm">
                <span className="text-xs text-muted-foreground block mb-1">Active AI Handshakes / min</span>
                <span className="text-2xl font-bold text-foreground">4,812</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
