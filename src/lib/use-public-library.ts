import { useEffect, useState } from "react";
import { getApiAssetUrl, getPublicMedia, type PublicMediaItem } from "@/lib/api";

/** One published library item, resolved to absolute asset URLs. */
export type PublicLibraryItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  /** What to show on the card: a generated video frame, or the photo itself. */
  image: string;
  /** What to open: the video file, or the full-size photo. */
  asset: string;
};

/**
 * SASA_PUBLIC_LIBRARY_V26 — published library media for the standalone
 * /videos and /photos pages.
 *
 * These pages listed only the bundled built-in catalogue, so an item an
 * administrator published was reachable from the Home feed but nowhere else.
 * The data comes from the public endpoint, which filters on
 * `visibility = 'public' AND publication_status = 'published'` in SQL, so a
 * draft or a family's private upload cannot be returned here regardless of
 * what this component does with the response.
 *
 * A failure is reported rather than swallowed: the built-in catalogue still
 * renders, and the caller shows the message instead of implying the library
 * is empty.
 */
export function usePublicLibrary(type: "video" | "photo") {
  const [items, setItems] = useState<PublicLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    getPublicMedia(type, 40)
      .then((media: PublicMediaItem[]) => {
        if (cancelled) return;

        setItems(
          media.map((item) => {
            const asset = getApiAssetUrl(item.public_url);
            const thumbnail = getApiAssetUrl(item.thumbnail_url);

            return {
              id: item.id,
              title: item.title,
              category: item.category?.trim() || "",
              description: item.description?.trim() || "",
              // A photo is its own picture. A video shows the frame the
              // backend extracted at upload time, never a generic icon.
              image: item.media_type === "photo" ? asset || thumbnail : thumbnail,
              asset,
            } satisfies PublicLibraryItem;
          }),
        );
      })
      .catch((cause: Error) => {
        if (!cancelled) setError(cause.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type]);

  return { items, loading, error };
}
