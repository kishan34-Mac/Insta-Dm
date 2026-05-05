import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Megaphone, MoreVertical, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { campaignApi, type Campaign } from "@/api/campaign";
import { useAuth } from "@/store/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Campaigns() {
  const { accessToken } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    if (!accessToken) return;
    try {
      const response = await campaignApi.getAll(accessToken);
      setCampaigns(response.data);
    } catch (error) {
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [accessToken]);

  const toggleStatus = async (id: string) => {
    if (!accessToken) return;
    try {
      const response = await campaignApi.toggleStatus(id, accessToken);
      setCampaigns(campaigns.map(c => c._id === id ? response.data : c));
      toast.success(`Campaign ${response.data.status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!accessToken) return;
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await campaignApi.delete(id, accessToken);
      setCampaigns(campaigns.filter(c => c._id !== id));
      toast.success("Campaign deleted");
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground text-sm mt-1">Build and manage your auto-DM funnels.</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/dashboard/campaigns/new"><Plus className="h-4 w-4" /> New campaign</Link>
        </Button>
      </div>

      {campaigns.length === 0 ? <EmptyState /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{c.name}</h3>
                    <Badge variant={c.status === "active" ? "default" : "secondary"} className={c.status === "active" ? "bg-success/15 text-success hover:bg-success/15" : ""}>
                      {c.status === "active" ? <span className="h-1.5 w-1.5 rounded-full bg-success mr-1.5 animate-pulse" /> : null}
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.keywords.map((k) => (
                      <span key={k} className="text-[11px] px-2 py-0.5 rounded-md bg-secondary border border-border">#{k}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStatus(c._id)}>
                    {c.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/campaigns/edit/${c._id}`}>Edit Campaign</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteCampaign(c._id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <Stat label="Sent" v={c.stats.totalSent.toLocaleString()} />
                <Stat label="Delivered" v={c.stats.totalDelivered.toLocaleString()} />
                <Stat label="Replied" v={c.stats.totalReplied.toLocaleString()} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

const Stat = ({ label, v }: { label: string; v: string }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="font-display font-semibold text-lg">{v}</p>
  </div>
);

const EmptyState = () => (
  <div className="glass-card p-12 text-center">
    <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
      <Megaphone className="h-6 w-6 text-primary" />
    </div>
    <h3 className="mt-4 font-semibold">No campaigns yet</h3>
    <p className="text-sm text-muted-foreground mt-1">Create your first auto-DM campaign in under 2 minutes.</p>
    <Button variant="hero" className="mt-6" asChild>
      <Link to="/dashboard/campaigns/new"><Plus className="h-4 w-4" /> Create campaign</Link>
    </Button>
  </div>
);
