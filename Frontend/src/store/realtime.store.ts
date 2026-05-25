import { create } from "zustand";
import { Campaign } from "@/api/campaign";
import { Lead } from "@/api/leads";
import { OverviewData } from "@/api/overview";
import { AnalyticsData } from "@/api/analytics";

interface RealtimeState {
  campaigns: Campaign[];
  leads: Lead[];
  overview: OverviewData | null;
  analytics: AnalyticsData | null;
  realtimeEvents: Array<{ id: string; type: string; data: unknown; timestamp: Date }>;

  // Initializers
  setCampaigns: (campaigns: Campaign[]) => void;
  setLeads: (leads: Lead[]) => void;
  setOverview: (overview: OverviewData) => void;
  setAnalytics: (analytics: AnalyticsData) => void;

  // Realtime mutation handlers for instant optimistic UI updates
  handleCampaignUpdated: (campaign: Campaign) => void;
  handleLeadCreated: (lead: Lead) => void;
  handleLeadUpdated: (lead: Lead) => void;
  
  // Realtime activity feed logging
  logRealtimeEvent: (type: string, data: unknown) => void;
  clearEvents: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  campaigns: [],
  leads: [],
  overview: null,
  analytics: null,
  realtimeEvents: [],

  setCampaigns: (campaigns) => set({ campaigns }),
  setLeads: (leads) => set({ leads }),
  setOverview: (overview) => set({ overview }),
  setAnalytics: (analytics) => set({ analytics }),

  handleCampaignUpdated: (campaign) =>
    set((state) => {
      // 1. Update the campaign in campaigns list
      const updatedCampaigns = state.campaigns.map((c) =>
        c._id === campaign._id ? campaign : c
      );

      // 2. If overview stats are loaded, adjust totalSent and activeCampaigns counts
      let updatedOverview = state.overview;
      if (updatedOverview) {
        // Calculate new sum of campaign stats
        const activeCount = updatedCampaigns.filter((c) => c.status === "active").length;
        const totalSentSum = updatedCampaigns.reduce((sum, c) => sum + (c.stats?.totalSent || 0), 0);
        const totalRepliedSum = updatedCampaigns.reduce((sum, c) => sum + (c.stats?.totalReplied || 0), 0);
        const replyRate = totalSentSum > 0 ? parseFloat(((totalRepliedSum / totalSentSum) * 100).toFixed(1)) : 0;

        updatedOverview = {
          ...updatedOverview,
          stats: {
            ...updatedOverview.stats,
            activeCampaigns: activeCount,
            totalSent: totalSentSum,
            replyRate,
          },
          charts: {
            ...updatedOverview.charts,
            campaignBars: updatedCampaigns
              .map((c) => ({ name: c.name, v: c.stats?.totalSent || 0 }))
              .sort((a, b) => b.v - a.v)
              .slice(0, 5),
          },
        };
      }

      // 3. If analytics summary is loaded, update conversion rates
      let updatedAnalytics = state.analytics;
      if (updatedAnalytics) {
        const totalSentSum = updatedCampaigns.reduce((sum, c) => sum + (c.stats?.totalSent || 0), 0);
        const totalRepliedSum = updatedCampaigns.reduce((sum, c) => sum + (c.stats?.totalReplied || 0), 0);
        const conversionRate = totalSentSum > 0 ? parseFloat(((totalRepliedSum / totalSentSum) * 100).toFixed(1)) : 0;

        // Recalculate best performing campaign
        const sorted = [...updatedCampaigns].sort(
          (a, b) => (b.stats?.totalSent || 0) - (a.stats?.totalSent || 0)
        );
        const bestName = sorted[0]?.name || "N/A";

        updatedAnalytics = {
          ...updatedAnalytics,
          summary: {
            ...updatedAnalytics.summary,
            totalSent: totalSentSum,
            totalReplies: totalRepliedSum,
            conversionRate,
            bestPerformingCampaign: bestName,
          },
        };
      }

      return {
        campaigns: updatedCampaigns,
        overview: updatedOverview,
        analytics: updatedAnalytics,
      };
    }),

  handleLeadCreated: (lead) =>
    set((state) => {
      // 1. Avoid inserting duplicate leads
      if (state.leads.some((l) => l._id === lead._id)) {
        return {};
      }

      // 2. Prepend lead
      const updatedLeads = [lead, ...state.leads];

      // 3. Update overview counters
      let updatedOverview = state.overview;
      if (updatedOverview) {
        // Prepend a recent activity item for this new lead match
        const campaignName = lead.campaigns?.[0]?.name || "Instagram Campaign";
        const newActivity = {
          id: `lead-${lead._id}`,
          who: `@${lead.igUsername}`,
          what: `matched keyword '${lead.keyword || "keyword"}' and received DM for '${campaignName}'`,
          when: "just now",
          timestamp: lead.createdAt,
          type: "lead" as const,
        };

        updatedOverview = {
          ...updatedOverview,
          stats: {
            ...updatedOverview.stats,
            totalLeads: updatedOverview.stats.totalLeads + 1,
          },
          recentActivities: [newActivity, ...updatedOverview.recentActivities].slice(0, 6),
        };
      }

      // 4. Update analytics counters
      let updatedAnalytics = state.analytics;
      if (updatedAnalytics) {
        updatedAnalytics = {
          ...updatedAnalytics,
          summary: {
            ...updatedAnalytics.summary,
            totalLeads: updatedAnalytics.summary.totalLeads + 1,
          },
        };
      }

      return {
        leads: updatedLeads,
        overview: updatedOverview,
        analytics: updatedAnalytics,
      };
    }),

  handleLeadUpdated: (lead) =>
    set((state) => {
      // 1. Update the lead in leads CRM list
      const updatedLeads = state.leads.map((l) => (l._id === lead._id ? lead : l));

      // 2. If status was updated to replied, also check activities to append a reply feed item
      let updatedOverview = state.overview;
      if (updatedOverview && lead.status === "replied") {
        const campaignName = lead.campaigns?.[0]?.name || "Instagram Campaign";
        
        // Check if reply activity already exists in feed to avoid duplicates
        const exists = updatedOverview.recentActivities.some((act) => act.id === `reply-${lead._id}`);
        if (!exists) {
          const newReplyActivity = {
            id: `reply-${lead._id}`,
            who: `@${lead.igUsername}`,
            what: `replied to your DM on campaign '${campaignName}'`,
            when: "just now",
            timestamp: lead.updatedAt || new Date().toISOString(),
            type: "reply" as const,
          };

          updatedOverview = {
            ...updatedOverview,
            recentActivities: [
              newReplyActivity,
              ...updatedOverview.recentActivities.filter((act) => act.id !== `lead-${lead._id}`),
            ].slice(0, 6),
          };
        }
      }

      return {
        leads: updatedLeads,
        overview: updatedOverview,
      };
    }),

  logRealtimeEvent: (type, data) =>
    set((state) => ({
      realtimeEvents: [
        {
          id: Math.random().toString(36).substring(7),
          type,
          data,
          timestamp: new Date(),
        },
        ...state.realtimeEvents,
      ].slice(0, 20),
    })),

  clearEvents: () => set({ realtimeEvents: [] }),
}));
