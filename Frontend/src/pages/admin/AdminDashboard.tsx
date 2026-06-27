import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  IndianRupee,
  Users,
  UserCheck,
} from "lucide-react";

import { adminApi } from "@/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const formatMoney = (amountInPaise: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountInPaise / 100);
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(date));
};

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminApi.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="admin-card">
        <CardContent className="p-6 text-sm text-destructive">
          Unable to load admin dashboard data. Check backend server and admin
          token.
        </CardContent>
      </Card>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: data.stats.totalUsers,
      icon: Users,
      description: "All registered accounts",
    },
    {
      title: "Active Subscribers",
      value: data.stats.activeUsers,
      icon: UserCheck,
      description: "Currently active plans",
    },
    {
      title: "Total Revenue",
      value: formatMoney(data.stats.totalRevenue),
      icon: IndianRupee,
      description: "Successful payment revenue",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Platform Overview
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor users, revenue and subscriptions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="admin-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {card.title}
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {card.value}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </div>

                  <div className="admin-stat-icon rounded-lg p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">
              Recent Users
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {data.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No users found.
              </p>
            ) : (
              data.recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <Badge
                      variant="secondary"
                      className="capitalize"
                    >
                      {user.plan}
                    </Badge>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">
              Recent Payments
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {data.recentPayments.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CreditCard className="mb-3 h-8 w-8 text-muted-foreground" />

                <p className="text-sm font-medium">
                  No payments yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Payment activity will appear here.
                </p>
              </div>
            ) : (
              data.recentPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {payment.userId?.name || "Unknown user"}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {payment.userId?.email ||
                        payment.razorpayOrderId}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">
                      {formatMoney(payment.amount)}
                    </p>

                    <Badge
                      variant="secondary"
                      className="mt-1 capitalize"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}