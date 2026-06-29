import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import { requestNotificationPermission, isNative } from "@/lib/native";

export function NotificationBell() {
  const [status, setStatus] = useState<"default" | "granted" | "denied" | "unsupported">("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isNative()) {
      setStatus("granted"); // assume native handles via registerPush
      return;
    }
    if (!("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission as typeof status);
  }, []);

  if (status === "unsupported") return null;

  const enable = async () => {
    const ok = await requestNotificationPermission();
    if (ok) {
      setStatus("granted");
      toast.success("Notifications enabled — notice ashley alert pabe");
    } else {
      setStatus((typeof Notification !== "undefined" ? (Notification.permission as typeof status) : "denied"));
      toast.error("Permission deoa hoy ni. Browser settings theke allow koro.");
    }
  };

  const Icon = status === "granted" ? BellRing : status === "denied" ? BellOff : Bell;
  const title =
    status === "granted"
      ? "Notifications on"
      : status === "denied"
      ? "Blocked — browser settings theke allow koro"
      : "Enable notifications";

  return (
    <button
      type="button"
      onClick={status === "granted" ? undefined : enable}
      title={title}
      aria-label={title}
      className={`flex items-center justify-center size-9 rounded-xl transition-all ${
        status === "granted"
          ? "bg-primary/10 text-primary"
          : "hover:bg-accent text-foreground/70 hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}
