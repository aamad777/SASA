/* SASA_AVATAR_FIX_V37 — fetch an image that lives behind a session.
 *
 * Avatars are served by GET /api/profiles/:id/avatar, which sits behind
 * requireSession so a stranger cannot enumerate children's faces. An <img>
 * tag cannot satisfy that: the browser sends no Authorization header, so the
 * request is answered 401 and the element renders as a broken image.
 *
 * Measured against production before this existed:
 *   GET /api/profiles/<id>/avatar                -> 401 application/json
 *   GET /api/profiles/<id>/avatar  + Bearer      -> 200 image/webp
 *
 * That is the whole of "a child cannot change their profile photo": the
 * upload succeeded — the server returned a 512x512 WebP — and then nothing on
 * screen changed, because every place that displayed it was pointing an <img>
 * at a URL that always answered 401.
 *
 * So the bytes are fetched with the token and handed to the <img> as an object
 * URL. Nothing about the route's authorisation changes; this only speaks its
 * protocol correctly. Returning null on any failure is deliberate: callers
 * fall back to the emoji or initial they already had, so a hiccup shows the
 * previous face rather than a broken one.
 */

import { useEffect, useState } from "react";

/**
 * Resolves `url` to a blob: URL fetched with `token`, or null.
 *
 * A url that is already directly renderable (a data: URI, an emoji preset, an
 * absolute URL somewhere public) is passed straight through — only the
 * session-protected API path needs fetching.
 */
export function useAuthorisedImage(
  url: string | null | undefined,
  token: string | null | undefined,
): string | null {
  const [resolved, setResolved] = useState<string | null>(() => passThrough(url));

  useEffect(() => {
    const direct = passThrough(url);

    if (direct !== null) {
      setResolved(direct);
      return;
    }

    if (!url || !token) {
      setResolved(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        // A 401/404 here is ordinary — a child with an emoji preset has no
        // file to serve — so it must not be noisy or blank out the avatar.
        if (!response.ok) throw new Error(String(response.status));
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        // Guard against a JSON error body arriving with a 200 from a proxy.
        if (!blob.type.startsWith("image/")) throw new Error("not an image");
        objectUrl = URL.createObjectURL(blob);
        setResolved(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setResolved(null);
      });

    return () => {
      cancelled = true;
      // Revoking on unmount is what stops a profile switch leaking one blob
      // per avatar for the lifetime of the tab.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, token]);

  return resolved;
}

/** Non-null when the value can go straight into an <img> as-is. */
function passThrough(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  // An emoji preset is not an image at all; the caller renders the character.
  if (url.startsWith("emoji:")) return null;
  /* A bare storage path is served by nothing — avatars are kept off the
   * public mount on purpose — so it must not be passed to an <img> as if it
   * were a URL. Treating it as unrenderable makes the caller fall back to the
   * emoji instead of showing a broken image. */
  if (url.startsWith("/avatars/")) return null;
  // Anything not on the session-protected avatar route is already fetchable.
  if (!url.includes("/profiles/") || !url.includes("/avatar")) return url;
  return null;
}
