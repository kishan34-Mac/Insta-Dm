import { useEffect } from "react";
import { useRealtime } from "../hooks/useRealtime";
import { useRealtimeStore } from "../store/realtime.store";
import { campaignApi } from "../api/campaign";
import { leadApi } from "../api/leads";
import { overviewApi } from "../api/overview";
import { analyticsApi } from "../api/analytics";
import { toast } from "sonner";

/**
 * RealtimeListener Component
 * Mounts at the root level of the application to run active background Socket.io event listeners.
 * Orchestrates optimistic updates, silent background API refetches, and realtime user toast notifications.
 */
export function RealtimeListener() {
  const { socket, isConnected } = useRealtime();
  const {
    handleCampaignUpdated,
    handleLeadCreated,
    handleLeadUpdated,
    setCampaigns,
    setLeads,
    setOverview,
    setAnalytics,
  } = useRealtimeStore();

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("📡 [RealtimeListener] Active Socket.io connection established. Mounting background listeners...");

    // 1. Campaign Updated (Auto-DM incremented, or user toggled campaign in UI)
    socket.on("campaign.updated", async (campaign) => {
      console.log("📡 [SocketEvent] campaign.updated received:", campaign);
      // Perform optimistic instant state mutation in Zustand store
      handleCampaignUpdated(campaign);

      // Perform silent background synchronization to match DB source of truth
      try {
        const res = await campaignApi.getAll();
        setCampaigns(res.data || []);
      } catch (err) {
        console.error("Failed to sync campaigns list:", err);
      }
    });

    // 2. Lead Created (A comment triggers keyword matching resulting in new lead generation)
    socket.on("lead.created", async (lead) => {
      console.log("📡 [SocketEvent] lead.created received:", lead);
      handleLeadCreated(lead);

      // Notify the user via rich Toast notification
      toast.success(`New lead from @${lead.igUsername}!`, {
        description: `Matched keyword #${lead.keyword || "automation"}`,
        duration: 5000,
      });

      // Silently sync CRM leads and overview graphs/metrics
      try {
        const [leadsRes, overviewRes] = await Promise.all([
          leadApi.getAll(),
          overviewApi.get(),
        ]);
        setLeads(leadsRes.data || []);
        if (overviewRes.success) setOverview(overviewRes.data);
      } catch (err) {
        console.error("Failed to sync CRM leads or overview stats:", err);
      }
    });

    // 3. Lead Updated (Lead status changed in CRM or comments logged)
    socket.on("lead.updated", async (lead) => {
      console.log("📡 [SocketEvent] lead.updated received:", lead);
      handleLeadUpdated(lead);

      // Silently sync leads list and overview graphs
      try {
        const [leadsRes, overviewRes] = await Promise.all([
          leadApi.getAll(),
          overviewApi.get(),
        ]);
        setLeads(leadsRes.data || []);
        if (overviewRes.success) setOverview(overviewRes.data);
      } catch (err) {
        console.error("Failed to sync CRM leads:", err);
      }
    });

    // 4. Overview Metrics Updated
    socket.on("overview.updated", async () => {
      console.log("📡 [SocketEvent] overview.updated received");
      try {
        const res = await overviewApi.get();
        if (res.success) setOverview(res.data);
      } catch (err) {
        console.error("Failed to sync overview statistics:", err);
      }
    });

    // 5. Analytics Charts/Stats Updated
    socket.on("analytics.updated", async () => {
      console.log("📡 [SocketEvent] analytics.updated received");
      try {
        const res = await analyticsApi.get();
        if (res.success) setAnalytics(res.data);
      } catch (err) {
        console.error("Failed to sync analytics statistics:", err);
      }
    });

    // 6. DM Sent Events
    socket.on("dm.sent", (data) => {
      console.log("📡 [SocketEvent] dm.sent received:", data);
      toast.info(`Automated DM sent to @${data.lead?.igUsername || "user"}`, {
        description: `"${data.message || ""}"`,
        duration: 4000,
      });
    });

    // 7. DM Delivered Events
    socket.on("dm.delivered", (data) => {
      console.log("📡 [SocketEvent] dm.delivered received:", data);
    });

    // 8. User Replied Back
    socket.on("dm.replied", (data) => {
      console.log("📡 [SocketEvent] dm.replied received:", data);
      toast.success(`@${data.lead?.igUsername || "user"} replied back! 💬`, {
        description: `"${data.message || ""}"`,
        duration: 6000,
      });
    });

    return () => {
      console.log("📡 [RealtimeListener] Cleaning up background Socket.io event listeners...");
      socket.off("campaign.updated");
      socket.off("lead.created");
      socket.off("lead.updated");
      socket.off("overview.updated");
      socket.off("analytics.updated");
      socket.off("dm.sent");
      socket.off("dm.delivered");
      socket.off("dm.replied");
    };
  }, [
    socket,
    isConnected,
    handleCampaignUpdated,
    handleLeadCreated,
    handleLeadUpdated,
    setCampaigns,
    setLeads,
    setOverview,
    setAnalytics,
  ]);

  return null; // Operates strictly in the background
}
