import { Capacitor } from "@capacitor/core";

export const isNative = () => Capacitor.isNativePlatform();

/**
 * Request notification permission.
 * - On native (Capacitor): registers for FCM/APNS push, returns token.
 * - On web: requests Notification API permission, returns "web" if granted.
 * Returns null if denied / unsupported.
 */
export async function registerPush(): Promise<string | null> {
  // --- Web browser / PWA ---
  if (!isNative()) {
    if (typeof window === "undefined" || !("Notification" in window)) return null;
    try {
      if (Notification.permission === "default") {
        const res = await Notification.requestPermission();
        return res === "granted" ? "web" : null;
      }
      return Notification.permission === "granted" ? "web" : null;
    } catch {
      return null;
    }
  }

  // --- Native (Android / iOS) ---
  const { PushNotifications } = await import("@capacitor/push-notifications");
  const { LocalNotifications } = await import("@capacitor/local-notifications");

  // also ask for local-notification permission so in-app banners work
  const localPerm = await LocalNotifications.checkPermissions();
  if (localPerm.display !== "granted") {
    await LocalNotifications.requestPermissions();
  }

  const perm = await PushNotifications.checkPermissions();
  let granted = perm.receive === "granted";
  if (!granted) {
    const req = await PushNotifications.requestPermissions();
    granted = req.receive === "granted";
  }
  if (!granted) return null;

  return new Promise((resolve) => {
    const tokenListener = PushNotifications.addListener("registration", (t) => {
      tokenListener.then((l) => l.remove());
      resolve(t.value);
    });
    PushNotifications.addListener("registrationError", () => resolve(null));
    PushNotifications.register();
  });
}

/** Fire a local notification (used when realtime delivers a new notice while the app is open). */
export async function showLocalNotice(title: string, body: string) {
  // Web fallback
  if (!isNative()) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification(title, { body, icon: "/favicon.ico" });
    } catch {
      /* ignore */
    }
    return;
  }

  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") {
    const req = await LocalNotifications.requestPermissions();
    if (req.display !== "granted") return;
  }
  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now() % 2_000_000_000,
        title,
        body,
        smallIcon: "ic_stat_icon",
        iconColor: "#4F46E5",
        schedule: { at: new Date(Date.now() + 100) },
      },
    ],
  });
}

/**
 * Trigger permission request from a user gesture (button click).
 * Browsers block permission prompts that aren't tied to a user gesture,
 * so the initial auto-call on mount silently fails. Call this from onClick.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const token = await registerPush();
  return token !== null;
}
