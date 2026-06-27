import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, Search } from "lucide-react";

import { adminApi } from "@/api/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "stopped";

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const getStatusVariant = (status: CampaignStatus) => {
  if (status === "active") return "default";
  if (status === "stopped") return "destructive";

  return "secondary";
};

export default function AdminCampaigns() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-campaigns", search, status],
    queryFn: () =>
      adminApi.getCampaigns({
        page: 1,
        limit: 50,
        search: search || undefined,
        status: status === "all" ? undefined : status,
      }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Campaigns
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor all campaigns created across the Athenura platform.
        </p>
      </div>

      <Card className="admin-card">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4" />
            Platform Campaigns
          </CardTitle>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search campaign or user"
                className="w-full pl-9 sm:w-60"
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-14 w-full" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              Unable to load campaigns. Check the admin API and login token.
            </p>
          )}

          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data?.campaigns.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-muted-foreground"
                      >
                        No campaigns found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.campaigns.map((campaign) => (
                      <TableRow key={campaign._id}>
                        <TableCell>
                          <div className="max-w-56">
                            <p className="truncate font-medium">
                              {campaign.name}
                            </p>

                            <p className="truncate text-xs text-muted-foreground">
                              {campaign.instagramAccount ||
                                "No Instagram account"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {campaign.user?.name || "Unknown user"}
                            </p>

                            <p className="max-w-40 truncate text-xs text-muted-foreground">
                              {campaign.user?.email || "—"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={getStatusVariant(
                              campaign.status as CampaignStatus,
                            )}
                            className="capitalize"
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="capitalize">
                          {campaign.triggerType?.replace("_", " ") || "—"}
                        </TableCell>

                        <TableCell>
                          {campaign.stats?.totalSent ?? 0}
                        </TableCell>

                        <TableCell>
                          {campaign.stats?.totalLeads ?? 0}
                        </TableCell>

                        <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}