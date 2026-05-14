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

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";

import { toast } from "sonner";
import { useAuth } from "@/store/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [accounts, setAccounts] =
    useState<InstagramAccount[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [disconnectingId, setDisconnectingId] =
    useState<string | null>(null);

  /* ==========================================
     FETCH CONNECTED ACCOUNTS
  ========================================== */

  const fetchAccounts = async () => {
    try {
      const response =
        await getInstagramAccounts();

      setAccounts(
        response?.data?.accounts || []
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
    fetchAccounts();
  }, []);

  /* ==========================================
     DISCONNECT ACCOUNT
  ========================================== */

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
      {/* ==========================================
          HEADER
      ========================================== */}

      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Settings
        </h2>

        <p className="text-muted-foreground text-sm mt-1">
          Manage your account,
          integrations and notifications.
        </p>
      </div>

      {/* ==========================================
          PROFILE
      ========================================== */}

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

      {/* ==========================================
          INSTAGRAM ACCOUNTS
      ========================================== */}

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />

              Loading accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Instagram className="h-10 w-10 mx-auto text-muted-foreground mb-3" />

              <p className="text-sm font-medium">
                No Instagram accounts
                connected
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Connect your Instagram
                Business account to start
                automating campaigns.
              </p>
            </div>
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

      {/* ==========================================
          NOTIFICATIONS
      ========================================== */}

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