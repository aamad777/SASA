/* SASA_FEED_ID_V19 — assigned-media ids used to be `1000000 + Number(item.id)`.
 * `media_files.id` is a `uuid`, so `Number()` returned NaN and EVERY assigned
 * item ended up with `id: NaN`. That is not cosmetic:
 *   - `key={video.id}` was NaN for every card;
 *   - `[NaN].includes(NaN)` is `true`, so saving one item showed all of them
 *     as saved, and blocking one blocked the whole assigned library;
 *   - reactions and watch progress keyed on `sasa-video-reaction-${id}`
 *     collapsed onto a single shared NaN key;
 *   - activity entries recorded `videoId: 0` for everything.
 *
 * The rest of the app is built around numeric ids (built-in videos use small
 * integers), so rather than widen the type everywhere this derives a stable,
 * collision-resistant positive integer from the uuid with an FNV-1a hash and
 * keeps it far above the built-in range. The same uuid always maps to the same
 * id, so saved/blocked/reaction state survives reloads. The untouched uuid is
 * carried alongside as `mediaId` for anything that needs the real key.
 *
 * This lives in its own module because every feed that mints these ids has to
 * agree on the ranges — family media, the public library and, since
 * SASA_FRIENDS_V32, media a friend shared. Two feeds inventing their own
 * offsets is how ids start colliding.
 */
const ASSIGNED_ID_BASE = 1_000_000;

/** Offset for media a friend shared, kept clear of the ranges above. */
const SHARED_ID_BASE = 3_000_000;

export function assignedMediaId(rawId: string | number): number {
  const value = String(rawId);

  // A backend that really does return a number keeps its original id.
  if (/^\d+$/.test(value)) {
    return ASSIGNED_ID_BASE + Number(value);
  }

  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return ASSIGNED_ID_BASE + (hash % 1_000_000_000);
}

/** Same stable hash, offset into its own range for library items. */
export function publicMediaId(rawId: string): number {
  return assignedMediaId(rawId) - ASSIGNED_ID_BASE;
}

/* Keyed on the media id rather than the share id, so a reaction or watch
 * position survives the same item being re-shared. */
export function sharedMediaId(rawId: string): number {
  return SHARED_ID_BASE + (assignedMediaId(rawId) - ASSIGNED_ID_BASE);
}
