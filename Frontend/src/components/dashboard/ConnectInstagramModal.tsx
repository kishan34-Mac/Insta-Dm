import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  Info,
  Shield,
  Instagram,
  Facebook,
  UserCheck,
  Lock,
  ExternalLink,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onConnect: () => Promise<void>;
}

export default function ConnectInstagramModal({
  open,
  onOpenChange,
  loading,
  onConnect,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
          max-w-[560px]
          p-0
          overflow-hidden
          rounded-3xl
          border
          border-border/60
          bg-background
        "
      >
        <div className="p-6">

          {/* HEADER */}

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold">
              Connect Instagram
            </h2>

            <button
              onClick={() =>
                onOpenChange(false)
              }
              className="
                h-9
                w-9
                rounded-full
                border
                border-border
                flex
                items-center
                justify-center
                hover:bg-muted
                transition-colors
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* INFO */}

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />

              <p className="text-sm">
                You'll be redirected to Meta
                (Facebook) to securely authorize
                access to your account.
              </p>
            </div>
          </div>

          {/* REQUIREMENTS */}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              What you'll need
            </h3>

            <div className="space-y-4">

              <Requirement
                icon={
                  <Instagram className="h-4 w-4 text-white" />
                }
                color="from-violet-500 to-fuchsia-500"
                title="Instagram Business or Creator Account"
                description="Personal accounts are not supported."
              />

              <Requirement
                icon={
                  <Facebook className="h-4 w-4 text-white" />
                }
                color="from-blue-500 to-blue-600"
                title="Linked Facebook Page"
                description="Your Instagram must be connected to a Facebook Page."
              />

              <Requirement
                icon={
                  <UserCheck className="h-4 w-4 text-white" />
                }
                color="from-green-500 to-emerald-600"
                title="Admin Access"
                description="You must have admin access to the Facebook Page."
              />

              <Requirement
                icon={
                  <Lock className="h-4 w-4 text-white" />
                }
                color="from-orange-500 to-amber-500"
                title="Permissions"
                description="We'll ask for permissions to read comments, send messages and manage your account."
              />
            </div>
          </div>

          {/* SECURITY */}

          <div className="mt-6 rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0" />

              <p className="text-sm">
                We never post on your behalf.
                Your data is secure and will never
                be shared with third parties.
              </p>
            </div>
          </div>

          {/* BUTTONS */}

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancel
            </Button>

            <Button
              variant="hero"
              className="flex-1"
              disabled={loading}
              onClick={onConnect}
            >
              {loading
                ? "Connecting..."
                : "Connect with Meta"}

              <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* FOOTER */}

          <div className="mt-5 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 100% secure • Official Meta Integration
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Requirement({
  icon,
  color,
  title,
  description,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`
          h-10
          w-10
          rounded-full
          bg-gradient-to-br
          ${color}
          flex
          items-center
          justify-center
          shrink-0
        `}
      >
        {icon}
      </div>

      <div>
        <h4 className="font-medium text-sm">
          {title}
        </h4>

        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}