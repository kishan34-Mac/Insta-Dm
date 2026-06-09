import { Instagram } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/api/http";

import ConnectInstagramModal from "./ConnectInstagramModal";

const ConnectInstagramButton = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleConnect = async (): Promise<void> => {
    try {
      setLoading(true);

      const auth = JSON.parse(
        localStorage.getItem("athenura.auth") || "{}"
      );

      const token = auth?.accessToken;

      if (!token) {
        alert("Login required");
        setLoading(false);
        return;
      }

      const encodedToken = encodeURIComponent(token);

      // Redirect to backend OAuth endpoint
      window.location.href =
        `${API_BASE_URL}/instagram/connect?token=${encodedToken}`;
    } catch (error) {
      console.error("Instagram connection failed:", error);

      alert("Instagram connect failed");

      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Instagram className="h-4 w-4" />
        Connect Instagram
      </Button>

      <ConnectInstagramModal
        open={open}
        onOpenChange={setOpen}
        loading={loading}
        onConnect={handleConnect}
      />
    </>
  );
};

export default ConnectInstagramButton;