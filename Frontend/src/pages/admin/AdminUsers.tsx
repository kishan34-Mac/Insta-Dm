import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";

import { adminApi } from "@/api/admin";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const formatDate = (date?: string | null) => {
  if (!date) return "Never";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(date));
};

const getStatusVariant = (status: string): BadgeVariant => {
  if (status === "active") return "default";
  if (status === "failed") return "destructive";

  return "secondary";
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", search, plan, status],
    queryFn: () =>
      adminApi.getUsers({
        page: 1,
        limit: 50,
        search: search.trim() || undefined,
        plan:
          plan === "all"
            ? undefined
            : (plan as "free" | "starter" | "pro" | "agency"),
        status:
          status === "all"
            ? undefined
            : (status as "free" | "pending" | "active" | "failed"),
      }),
  });

  const users = data?.users ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Users
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View, search, and monitor all DMPilot user accounts.
        </p>
      </div>

      <Card className="admin-card">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            User Directory
          </CardTitle>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email"
                className="w-full pl-9 sm:w-56"
              />
            </div>

            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="agency">Agency</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
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
              Unable to load users. Check the admin API and your login token.
            </p>
          )}

          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Instagram</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-28 text-center text-muted-foreground"
                      >
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>

                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role || "user"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {user.plan}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={getStatusVariant(user.subscriptionStatus)}
                            className="capitalize"
                          >
                            {user.subscriptionStatus}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {user.instagramAccounts?.length ?? 0} connected
                        </TableCell>

                        <TableCell>{formatDate(user.createdAt)}</TableCell>

                        <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
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