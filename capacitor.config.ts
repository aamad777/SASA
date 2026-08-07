import type { CapacitorConfig } from "@capacitor/cli";

/* SARA_MOBILE_ANDROID_V1 */

// SARA is a TanStack Start app rendered server-side by Nitro (see
// src/server.ts) — there is no static `index.html`/SPA bundle to hand
// Capacitor as `webDir` at runtime; the shell in ./mobile-shell exists only
// to satisfy the Capacitor CLI's requirement that webDir point at a real
// directory. Instead, `server.url` below points the native WebView straight
// at the live production deployment, so the Android app renders the exact
// same SSR'd app the desktop browser gets — no separate mobile build to
// keep in sync, no behavior drift. Because the WebView loads pages from
// https://sara.khader-ai.online, the app's own relative `/api` fetches
// (VITE_API_BASE_URL=/api in the web build) resolve same-origin against
// that host automatically — no cross-origin config needed, and no reason to
// touch .env/.env.local for this.
const config: CapacitorConfig = {
  appId: "online.khaderai.sara",
  appName: "SARA",
  webDir: "mobile-shell",
  server: {
    url: "https://sara.khader-ai.online",
    // HTTPS only — cleartext explicitly left disabled per the task's
    // security requirement.
    androidScheme: "https",
    cleartext: false,
  },
  android: {
    // Belt-and-suspenders alongside cleartext:false above — refuses any
    // accidental http:// navigation/resource load network-wide.
    allowMixedContent: false,
  },
};

export default config;
