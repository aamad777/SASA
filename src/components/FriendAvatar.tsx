/* SASA_KID_FRIENDS_V35 — one friendly face, everywhere a friend is shown.
 *
 * Every friend circle used to render `<img src={child.avatar_url}>` directly
 * and, in the browser, every one of them was a broken-image icon. Two reasons,
 * both of which this has to survive:
 *
 *   - the URL the API hands out is `/api/profiles/<id>/avatar`, and that route
 *     sits behind requireSession. An <img> tag sends no Authorization header,
 *     so the request is answered 401 whatever the child is allowed to see;
 *   - the route only serves an uploaded `/avatars/…` file. A child whose
 *     avatar is an emoji preset ("emoji:🐣", which is what the profile
 *     creation flow stores) has no file to serve and is answered 404.
 *
 * A friend's face is the whole point of the Friends page, so rather than show
 * a broken image this falls back to the child's initial in the theme's own
 * colours. That is a real piece of that child's identity, not invented data,
 * and it keeps working no matter which of the two cases applies.
 */

import { useEffect, useState } from "react";
import type { SafeChild } from "@/lib/friends-api";

type Props = {
  child: SafeChild;
  /** Extra classes, e.g. "is-lg" for the friend page's larger circle. */
  className?: string;
  /** Which circle style to use — they differ in size and context. */
  variant?: "grid" | "row" | "pick";
};

const BASE_CLASS: Record<NonNullable<Props["variant"]>, string> = {
  grid: "sasa-friendgrid-avatar",
  row: "sasa-friend-avatar",
  pick: "sasa-friendpick-avatar",
};

export default function FriendAvatar({ child, className, variant = "grid" }: Props) {
  const [failed, setFailed] = useState(false);

  // A different friend gets a fresh chance to load their own picture.
  useEffect(() => setFailed(false), [child.avatar_url]);

  const initial = (child.display_name || "?").charAt(0).toUpperCase();
  const showImage = Boolean(child.avatar_url) && !failed;
  const classes = [BASE_CLASS[variant], className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-hidden="true">
      {showImage ? (
        <img
          src={child.avatar_url as string}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        initial
      )}
    </span>
  );
}
