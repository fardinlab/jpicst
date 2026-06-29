import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

export const isNative = () => Capacitor.isNativePlatform();

let savedPushToken: string | null = null;
let pushRegistrationPromise: Promise<string | null> | null = null;
let autoRegistrationStarted = false;

async function saveTokenToServer(token: string, platform: string) {
  try {
    await supabase.from("device_tokens").upsert(
      { token, platform, updated_at: new Date().toISOString() },
      { onConflict: "token" },
    );
  } catch (e) {
    console.warn("save token failed", e);
  }
}

/**
 * Request notification permission.
 * - On native (Capacitor): registers for FCM/APNS push, saves token to Supabase.
 * - On web: requests Notification API permission.
 */
export async function registerPush(): Promise<string | null> {
  if (savedPushToken) return savedPushToken;
  if (pushRegistrationPromise) return pushRegistrationPromise;

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

  pushRegistrationPromise = registerNativePush().finally(() => {
    pushRegistrationPromise = null;
  });

  return pushRegistrationPromise;
}

async function registerNativePush(): Promise<string | null> {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const { LocalNotifications } = await import("@capacitor/local-notifications");

    const current = await PushNotifications.checkPermissions();
    let receivePermission = current.receive;

    if (receivePermission !== "granted") {
      const requested = await PushNotifications.requestPermissions();
      receivePermission = requested.receive;
    }

    if (receivePermission !== "granted") return null;

    const localPermission = await LocalNotifications.checkPermissions();
    if (localPermission.display !== "granted") {
      await LocalNotifications.requestPermissions();
    }

    if (Capacitor.getPlatform() === "android") {
      await PushNotifications.createChannel({
        id: "notices",
        name: "Class Portal Notices",
        description: "Routine and notice alerts",
        importance: 5,
        visibility: 1,
        vibration: true,
      }).catch(() => {});
    }

    return await new Promise<string | null>(async (resolve) => {
      let settled = false;
      let registrationListener: PluginListenerHandle | undefined;
      let errorListener: PluginListenerHandle | undefined;

      const finish = async (token: string | null) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        registrationListener?.remove();
        errorListener?.remove();
        if (token) {
          savedPushToken = token;
          await saveTokenToServer(token, Capacitor.getPlatform());
        }
        resolve(token);
      };

      const timeoutId = window.setTimeout(() => finish(null), 15_000);

      registrationListener = await PushNotifications.addListener("registration", (token) => {
        void finish(token.value);
      });
      errorListener = await PushNotifications.addListener("registrationError", () => {
        void finish(null);
      });

      await PushNotifications.register();
    });
  } catch (error) {
    console.warn("push registration failed", error);
    return null;
  }
}

export function startNotificationRegistration() {
  if (typeof window === "undefined" || autoRegistrationStarted) return;
  autoRegistrationStarted = true;

  const request = () => {
    void registerPush();
  };

  request();
  const retryTimer = window.setTimeout(request, 1_000);

  window.addEventListener("pointerdown", request, { once: true, passive: true });
  window.addEventListener("focus", request, { passive: true });

  return () => {
    window.clearTimeout(retryTimer);
    window.removeEventListener("pointerdown", request);
    window.removeEventListener("focus", request);
  };
}

/** Fire a local notification (used when realtime delivers a new notice while the app is open). */
export async function showLocalNotice(title: string, body: string) {
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

export async function requestNotificationPermission(): Promise<boolean> {
  const token = await registerPush();
  return token !== null;
}
