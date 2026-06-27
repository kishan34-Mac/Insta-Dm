import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Search } from "lucide-react";

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

const formatMoney = (amountInPaise: number, currency: string) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amountInPaise / 100);
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const paymentVariant = (status: string) => {
  if (["captured", "authorized", "verified"].includes(status)) {
    return "default";
  }

  if (status === "failed") {
    return "destructive";
  }

  return "secondary";
};

export default function AdminPayments() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-payments", search, plan, status],
    queryFn: () =>
      adminApi.getPayments({
        page: 1,
        limit: 50,
        search: search || undefined,
        plan: plan === "all" ? undefined : plan,
        status: status === "all" ? undefined : status,
      }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Payments
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Track Razorpay orders, successful payments, and failed transactions.
        </p>
      </div>

      <Card className="admin-card">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Payment History
          </CardTitle>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search user or order ID"
                className="w-full pl-9 sm:w-60"
              />
            </div>

            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="captured">Captured</SelectItem>
                <SelectItem value="authorized">Authorized</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
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
              Unable to load payments. Check your admin API.
            </p>
          )}

          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data?.payments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-28 text-center text-muted-foreground"
                      >
                        No payment records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {payment.userId?.name || "Deleted user"}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {payment.userId?.email || "No email available"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {payment.plan}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-medium">
                          {formatMoney(payment.amount, payment.currency)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={paymentVariant(payment.status)}
                            className="capitalize"
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="max-w-40 truncate font-mono text-xs">
                          {payment.razorpayOrderId}
                        </TableCell>

                        <TableCell className="max-w-40 truncate font-mono text-xs">
                          {payment.razorpayPaymentId || "—"}
                        </TableCell>

                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
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