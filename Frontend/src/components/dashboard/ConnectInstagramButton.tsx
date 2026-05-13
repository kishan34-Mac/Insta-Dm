import { Loader2, Instagram } from "lucide-react";

import { useState } from "react";

import { connectInstagram } from "@/api/instagram";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";

const ConnectInstagramButton = () => {
  const [loading, setLoading] =
    useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);

      const response =
        await connectInstagram();

      if (!response?.url) {
        throw new Error(
          "OAuth URL not received"
        );
      }

      window.location.href =
        response.url;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to connect Instagram"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Instagram className="h-4 w-4" />
      )}

      {loading
        ? "Connecting..."
        : "Connect Instagram"}
    </Button>
  );
};

export default ConnectInstagramButton;