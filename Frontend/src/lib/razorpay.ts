let razorpayScriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(keyId?: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only be loaded in browser"));
  }

  const w = window as any;
  if (w.Razorpay) {
    return Promise.resolve();
  }


  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-razorpay='true']");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay script")));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.defer = true;
      script.dataset.razorpay = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay script"));
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

