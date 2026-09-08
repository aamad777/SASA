import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useVisibleViewportHeight } from "../hooks/use-visible-viewport-height";
import { useAndroidBackRoot } from "../hooks/use-android-back";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-input bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        // SARA_MOBILE_ANDROID_V1 — viewport-fit=cover lets content draw
        // edge-to-edge and makes env(safe-area-inset-*) resolve to real
        // values inside the Android WebView instead of 0px; a no-op on
        // desktop browsers, which don't have insets to report.
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "Little Explorers" },
      {
        name: "description",
        content:
          "A safe, cheerful place for toddlers to watch videos, look at photos, and play & learn.",
      },
      { name: "author", content: "Little Explorers" },
      { property: "og:title", content: "Little Explorers" },
      {
        property: "og:description",
        content:
          "A safe, cheerful place for toddlers to watch videos, look at photos, and play & learn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@LittleExplorers" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;700;800&family=Quicksand:wght@500;600;700&family=Sora:wght@500;600;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* SASA_KID_THEMES_V34 — apply the saved theme BEFORE first paint.
            The React effect that used to do this runs after mount, so every
            start flashed the default theme first. Inline and synchronous so
            the attribute is on <html> before any pixel is drawn; wrapped in
            try/catch because storage can be unavailable, and silent because a
            missing theme is not an error.

            SASA_KID_THEMES_V35 — when a child IS known, only that child's key
            is read. Falling through to the shared key painted the previous
            child's theme for a sibling who had never chosen one, which then
            snapped back to the default on mount: the flash this script
            exists to prevent. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=localStorage.getItem('sasa-active-kid-id');var t=p?localStorage.getItem('sasa-app-theme:'+p):localStorage.getItem('sasa-app-theme');if(t&&/^[a-z]+$/.test(t)){document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-app-theme',t);}}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // SARA_ANDROID_KEYBOARD_DIALOG_V15 — mounted once at the app root so the
  // --app-visible-height CSS var it maintains is available to every
  // keyboard-aware dialog (Add Kid Profile, PIN dialogs) without each one
  // re-registering a visualViewport listener.
  useVisibleViewportHeight();

  /* SASA_ANDROID_BACK_V40 — installs the one `backButton` listener for the
   * whole app. It has to exist even with nothing open: Capacitor's own
   * no-listener path goes back if it can and otherwise does nothing at all,
   * so without this Back is simply dead at the app's root. */
  useAndroidBackRoot();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
