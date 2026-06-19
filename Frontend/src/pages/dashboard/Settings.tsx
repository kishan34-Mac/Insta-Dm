

import {
  Instagram,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  disconnectInstagram,
  getInstagramAccounts,
  InstagramAccount,
} from "@/api/instagram";

import ConnectInstagramButton from "@/components/dashboard/ConnectInstagramButton";

import { Button } from "@/components/ui/button";
import { PageEmpty, PageLoading, PageError } from "@/components/dashboard/page-states";


import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";

import { toast } from "sonner";
import { useAuth } from "@/store/AuthContext";

import { billingApi, type PlanKey } from "@/api/billing";
import { loadRazorpayScript } from "@/lib/razorpay";

export default function Settings() {
  const { user } = useAuth();
  const [accounts, setAccounts] =
    useState<InstagramAccount[]>([]);

  const [loading, setLoading] =
    useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<PlanKey | null>(null);

  const planToRequestKey = (plan: PlanKey) => {
    if (plan === "starter") return "STARTER";
    if (plan === "pro") return "PRO";
    return "AGENCY";
  };



  const [disconnectingId, setDisconnectingId] =
    useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const response =
        await getInstagramAccounts();

      setAccounts(
        response?.accounts || []
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load Instagram accounts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success === "instagram_connected") {
      toast.success("Instagram account connected successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      let errorMsg = "Connection failed";
      if (error === "no_instagram_business_account") {
        errorMsg = "Your FB page must be linked to an Instagram Business account.";
      } else if (error === "no_pages_found") {
        errorMsg = "No Facebook Pages linked with business tasks were found.";
      } else {
        errorMsg = `Connection failed: ${error.replace(/_/g, " ")}`;
      }
      toast.error(errorMsg);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    fetchAccounts();
  }, []);

  const startUpgrade = async (plan: PlanKey) => {
    try {
      if (upgradingPlan) return;

      setUpgradingPlan(plan);
      await loadRazorpayScript();

      const order = await billingApi.createRazorpayOrder({
        // Backend expects upper-case plan keys: STARTER | PRO | AGENCY
        plan: planToRequestKey(plan),
      });

      const w = window as unknown as { Razorpay?: new (options: unknown) => { open: () => void } };
      const rzp = new (w.Razorpay as unknown as { open: () => void })({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,

        name: "Insta-Dm",
        description: `Upgrade to ${plan.toUpperCase()}`,
        order_id: order.orderId,
        notes: {
          plan,
        },
        handler: async function (response: unknown) {
          const paymentId =
            (response as any)?.razorpay_payment_id as
              | string
              | undefined;

          const signature =
            (response as any)?.razorpay_signature as
              | string
              | undefined;

          const orderId =
            (response as any)?.razorpay_order_id ??
            order.orderId;




          if (!paymentId || !signature) {
            toast.error("Payment verification failed");
            setUpgradingPlan(null);
            return;
          }

          try {
            await billingApi.verifyRazorpayPayment({
              razorpay_order_id: orderId,
              razorpay_payment_id: paymentId,
              razorpay_signature: signature,
              plan,
            });

            toast.success("Upgrade successful!");
            window.location.reload();
          } catch (e) {
            console.error(e);
            toast.error("Upgrade verification failed");
          } finally {
            setUpgradingPlan(null);
          }
        },

        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: function () {
            setUpgradingPlan(null);
          },
        },
      });

      rzp.open();
    } catch (e) {
      console.error(e);
      const serverMsg = e?.response?.data?.message;
      toast.error(serverMsg ? `Upgrade failed: ${serverMsg}` : "Upgrade failed");
      setUpgradingPlan(null);
    }

  };

  const handleDisconnect = async (
    igUserId: string
  ) => {

    try {
      setDisconnectingId(igUserId);

      await disconnectInstagram(
        igUserId
      );

      toast.success(
        "Instagram disconnected"
      );

      setAccounts((prev) =>
        prev.filter(
          (acc) =>
            acc.igUserId !== igUserId
        )
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to disconnect account"
      );
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Settings
        </h2>

        <p className="text-muted-foreground text-sm mt-1">
          Manage your account,
          integrations and notifications.
        </p>
      </div>

      <section className="glass-card p-6">
        <h3 className="font-semibold">
          Profile
        </h3>

        <p className="text-xs text-muted-foreground">
          Update your personal
          information.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div>
            <Label>Full name</Label>

            <Input
              defaultValue={user?.name || ""}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Email</Label>

            <Input
              type="email"
              defaultValue={user?.email || ""}
              className="mt-1.5"
            />
          </div>
        </div>

        <Button
          variant="hero"
          className="mt-5"
        >
          Save changes
        </Button>
      </section>

      <section className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              Connected accounts
            </h3>

            <p className="text-xs text-muted-foreground">
              Instagram via Meta Graph
              API.
            </p>
          </div>

          <ConnectInstagramButton />
        </div>

        <div className="mt-5 space-y-4">
          {loading ? (
            <PageLoading />
          ) : accounts.length === 0 ? (
            <PageEmpty
              title="No Instagram accounts connected"
              description="Connect your Instagram Business account to start automating campaigns."
            />
          ) : (

            accounts.map((account) => (
              <div
                key={account.igUserId}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-orange-400 flex items-center justify-center">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>

                  <div>
                    <p className="font-medium text-sm">
                      @
                      {
                        account.igUsername
                      }
                    </p>

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />

                      Connected
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      {
                        account.pageName
                      }
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    disconnectingId ===
                    account.igUserId
                  }
                  onClick={() =>
                    handleDisconnect(
                      account.igUserId
                    )
                  }
                >
                  {disconnectingId ===
                  account.igUserId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Disconnect"
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="glass-card p-6">
        <h3 className="font-semibold">
          Billing & Upgrade
        </h3>

        <p className="text-xs text-muted-foreground mt-1">
          Upgrade your plan using Razorpay.
        </p>

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Current plan</p>
              <p className="text-xs text-muted-foreground mt-1">
                {user?.plan ? user.plan.toUpperCase() : "FREE"}
              </p>
            </div>

            <Button
              variant="outline"
              disabled={upgradingPlan !== null}
              onClick={() => startUpgrade("starter")}
              className="whitespace-nowrap"
            >
              Upgrade Starter
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Need more power?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Choose Pro or Agency.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap justify-end">
              <Button
                variant="outline"
                disabled={upgradingPlan !== null}
                onClick={() => startUpgrade("pro")}
              >
                Upgrade Pro
              </Button>
              <Button
                variant="outline"
                disabled={upgradingPlan !== null}
                onClick={() => startUpgrade("agency")}
              >
                Upgrade Agency
              </Button>
            </div>
          </div>

          {upgradingPlan !== null && (
            <p className="text-xs text-muted-foreground">
              Opening Razorpay checkout for <span className="font-medium">{upgradingPlan}</span>...
            </p>
          )}
        </div>
      </section>

      <section className="glass-card p-6">
        <h3 className="font-semibold">
          Notifications
        </h3>


        <div className="mt-5 space-y-4">
          {[
            [
              "Daily summary email",
              "Recap of DMs, leads and conversions every morning.",
              true,
            ],

            [
              "New lead captured",
              "Get notified when a high-intent comment is matched.",
              true,
            ],

            [
              "Campaign paused by Meta",
              "Alerts if any policy issue affects your campaign.",
              false,
            ],
          ].map(([title, desc, on]) => (
            <div
              key={title as string}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {title}
                </p>

                <p className="text-xs text-muted-foreground">
                  {desc}
                </p>
              </div>

              <Switch
                defaultChecked={
                  on as boolean
                }
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}