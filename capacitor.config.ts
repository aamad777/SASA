import type { CapacitorConfig } from "@capacitor/cli";

/* SASA_MOBILE_ANDROID_V1 */

// SASA is a TanStack Start app rendered server-side by Nitro (see
// src/server.ts) — there is no static `index.html`/SPA bundle to hand
// Capacitor as `webDir` at runtime; the shell in ./mobile-shell exists only
// to satisfy the Capacitor CLI's requirement that webDir point at a real
// directory. Instead, `server.url` below points the native WebView straight
// at the SASA production frontend, so the Android app renders the exact same
// SSR'd app the desktop browser gets — no separate mobile build to keep in
// sync, no behavior drift.
//
// The host is the SASA frontend domain, never an API endpoint: the WebView
// must load the app shell and let the app's own relative `/api` fetches
// (VITE_API_BASE_URL=/api in the web build) resolve same-origin against that
// same host. Pointing this at an /api URL would load JSON in the WebView.
const config: CapacitorConfig = {
  appId: "online.dadai.sasa",
  appName: "SASA",
  webDir: "mobile-shell",
  server: {
    url: "https://sasa.dad-ai.online",
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
