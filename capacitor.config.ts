import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.classportalcst5th",
  appName: "Class Portal CST 5th",
  webDir: "dist",
  server: {
    // Hot-reload from Lovable preview while developing.
    // Remove the `url` line before producing a release build to ship
    // the bundled web assets from `dist/` instead.
    url: "https://5f6f9d35-30e5-45c3-86ff-56444f2723c2.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
