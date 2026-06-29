import { Capacitor } from "@capacitor/core";

export const isNative = () => Capacitor.isNativePlatform();

/**
 * Register the device for push notifications and request permission.
 * Returns the FCM/APNS token, or null if running in the browser / denied.
 *
 * The token must be saved server-side (e.g. in a `device_tokens` table)
 * so a server function can call FCM / APNs to deliver pushes when a new
 * notice is published.
 */
export async function registerPush(): Promise<string | null> {
  if (!isNative()) return null;
  const { PushNotifications } = await import("@capacitor/push-notifications");

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

/** Fire a local notification (used as a fallback when realtime delivers a new notice while the app is open). */
export async function showLocalNotice(title: string, body: string) {
  if (!isNative()) return;
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
        schedule: { at: new Date(Date.now() + 100) },
      },
    ],
  });
}
