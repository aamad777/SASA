import IntroSplash from "@/components/IntroSplash";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";

import AddProfile, { type CreatedProfile } from "@/components/AddProfile";
import DeviceLocked, { type LockScreenReason } from "@/components/DeviceLocked";
import DatabaseProfileSelection, {
  getDatabaseProfileColor,
  getDatabaseProfileEmoji,
} from "@/components/DatabaseProfileSelection";
import KidsVideoHome, { type KidsHomeTab, type KidsVideoItem } from "@/components/KidsVideoHome";
import { mediaThumbnailFallback } from "@/components/KidsVideoHome";
import KidsVideoPlayer from "@/components/KidsVideoPlayer";
import ParentalGate from "@/components/ParentalGate";
import ParentLogin from "@/components/ParentLogin";
import ParentDashboard, {
  defaultParentControlSettings,
  type ParentControlSettings,
} from "@/components/ParentDashboard";
import ProfileSelection from "@/components/ProfileSelection";
import FreeAccountBanner from "@/components/FreeAccountBanner";
import { recordActivity, removeActivityForProfile } from "@/lib/activity";
import {
  getApiAssetUrl,
  getApiHealth,
  getChildAssignedMedia,
  getCurrentUser,
  getPublicMedia,
  profileAvatarUrl,
  getChildren,
  type AssignedChildMedia,
  type DatabaseChild,
} from "@/lib/api";

export const Route = createFileRoute("/")({ component: SasaEntry });

type Profile = {
  // Real database children carry the backend's string id (see
  // DatabaseChild.id in src/lib/api.ts); locally-created custom profiles
  // (ProfileSelection) still generate a plain number id. Both are valid here.
  id: number | string;
  name: string;
  emoji: string;
  color: string;
  image?: string;
};

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
 */
const ASSIGNED_ID_BASE = 1_000_000;

/** Same stable hash, offset into its own range for library items. */
function publicMediaId(rawId: string): number {
  return assignedMediaId(rawId) - ASSIGNED_ID_BASE;
}

function assignedMediaId(rawId: string | number): number {
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

function getStorageItem(key: string): string | null {
  if (typeof window !== "undefined" && typeof window.localStorage?.getItem === "function") {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
}

const KID_SECTIONS: KidsHomeTab[] = [
  "home",
  "search",
  "library",
  "songs",
  "games",
  "studio",
  "profile",
];

/**
 * `/?section=games` opens the app straight on that kid section — used by the
 * standalone /learn and /videos pages so their links go somewhere real.
 */
function getSectionFromUrl(): KidsHomeTab {
  if (typeof window === "undefined") return "home";

  const requested = new URLSearchParams(window.location.search).get("section");

  return KID_SECTIONS.find((section) => section === requested) ?? "home";
}

function normalizeParentName(value: unknown): string {
  if (typeof value !== "string") return "Parent";

  const name = value.trim();

  if (!name || ["undefined", "null"].includes(name.toLowerCase())) {
    return "Parent";
  }

  return name;
}

function SasaEntry() {
  const [showIntro, setShowIntro] = useState(true);

  return showIntro ? <IntroSplash onComplete={() => setShowIntro(false)} /> : <SasaApp />;
}

function SasaApp() {
  const [parentToken, setParentToken] = useState<string | null>(() =>
    getStorageItem("sasa-parent-token"),
  );

  const [guestMode, setGuestMode] = useState(() => !getStorageItem("sasa-parent-token"));

  const [parentName, setParentName] = useState(() =>
    normalizeParentName(getStorageItem("sasa-parent-name")),
  );

  const [databaseChildren, setDatabaseChildren] = useState<DatabaseChild[]>([]);

  useEffect(() => {
    if (!parentToken) return;

    localStorage.removeItem("sasa-account-mode");

    if (guestMode) {
      setGuestMode(false);
    }
  }, [parentToken, guestMode]);
  const [databaseChildrenLoading, setDatabaseChildrenLoading] = useState(false);
  const [databaseChildrenError, setDatabaseChildrenError] = useState("");

  const loadDatabaseChildren = async (token: string) => {
    setDatabaseChildrenLoading(true);
    setDatabaseChildrenError("");
    try {
      const children = await getChildren(token);
      setDatabaseChildren(children);
    } catch (error) {
      setDatabaseChildrenError(
        error instanceof Error ? error.message : "Unable to load child profiles.",
      );
    } finally {
      setDatabaseChildrenLoading(false);
    }
  };

  useEffect(() => {
    if (parentToken) loadDatabaseChildren(parentToken);
  }, [parentToken]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedKidsVideo, setSelectedKidsVideo] = useState<KidsVideoItem | null>(null);
  const [assignedVideos, setAssignedVideos] = useState<KidsVideoItem[]>([]);

  const [assignedMediaError, setAssignedMediaError] = useState("");
  const [assignedMediaLoading, setAssignedMediaLoading] = useState(false);
  const [assignedMediaRetryToken, setAssignedMediaRetryToken] = useState(0);

  /* SASA_PUBLIC_LIBRARY_V25 — published SASA library media, shown to everyone
   * including guests. It comes from the public endpoint, never from a child
   * profile, so nothing here can be a draft or another family's upload. */
  const [publicMedia, setPublicMedia] = useState<KidsVideoItem[]>([]);
  const [publicMediaError, setPublicMediaError] = useState("");
  const [publicMediaLoading, setPublicMediaLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setPublicMediaLoading(true);
    setPublicMediaError("");

    getPublicMedia(undefined, 40)
      .then((items) => {
        if (cancelled) return;

        setPublicMedia(
          items.map((item) => {
            const isPhoto = item.media_type === "photo";
            const asset = getApiAssetUrl(item.public_url);
            const thumb = getApiAssetUrl(item.thumbnail_url);

            return {
              // Kept clear of both the built-in ids and the assigned-media
              // range so a library item can never collide with either.
              id: 2000000 + publicMediaId(item.id),
              title: item.title,
              duration: isPhoto ? "Photo" : "Video",
              category: item.category?.trim() || "",
              // A real generated frame when the backend made one; the shared
              // placeholder only when it genuinely could not.
              image: isPhoto ? asset : thumb || mediaThumbnailFallback,
              sourceType: isPhoto ? "photo" : "upload",
              sourceUrl: asset,
              createdAt: item.published_at || item.created_at,
              sourceLabel: "SASA library",
              description: item.description || undefined,
              mediaId: item.id,
            } satisfies KidsVideoItem;
          }),
        );
      })
      .catch((error: Error) => {
        if (!cancelled) setPublicMediaError(error.message);
      })
      .finally(() => {
        if (!cancelled) setPublicMediaLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assignedMediaRetryToken]);

  const [homeTab, setHomeTab] = useState<KidsHomeTab>(getSectionFromUrl);

  /* The family's own assigned media first, then the published SASA library.
   * A guest has no assigned media, so they simply see the library. */
  /* SASA_ADMIN_UI_V25 — whether to show the Admin entry comes from the
   * server's own answer about this session, never from a stored flag. */
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!parentToken) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    getCurrentUser(parentToken)
      .then((account) => {
        if (!cancelled) setIsAdmin(account?.role === "admin");
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });

    return () => {
      cancelled = true;
    };
  }, [parentToken]);

  const feedMedia = useMemo(
    () => [...assignedVideos, ...publicMedia],
    [assignedVideos, publicMedia],
  );

  useEffect(() => {
    if (!parentToken || !profile) {
      setAssignedVideos([]);
      setAssignedMediaError("");
      setAssignedMediaLoading(false);
      return;
    }

    let cancelled = false;

    const loadAssignedVideos = async () => {
      setAssignedMediaError("");
      setAssignedMediaLoading(true);

      try {
        const media = await getChildAssignedMedia(parentToken, profile.id);

        if (cancelled) return;

        // SARA_ASSIGNED_MEDIA_MAPPING_V5 — maps raw backend media records onto
        // the KidsVideoItem shape the home screen, categories, and player all
        // consume. Keep this the single source of truth for that mapping so
        // photo/video/YouTube detection stays consistent everywhere.
        const mapped: KidsVideoItem[] = media.map((item: AssignedChildMedia) => {
          /* Prefer the server-minted URL. Private media is no longer at a
           * guessable /uploads path, and this is the only address that
           * re-authorises on every request. */
          const publicUrl = item.content_url || item.public_url || item.storage_path || "";

          const youtubeMatch = publicUrl.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,20})/,
          );

          const youtubeVideoId = youtubeMatch?.[1] || undefined;

          const isYoutube = Boolean(youtubeVideoId);
          // Accept "image" as a defensive alias for "photo" in case a given
          // backend record uses either label for the same media kind.
          const isPhoto = item.media_type === "photo" || item.media_type === "image";
          const assetUrl = isYoutube ? publicUrl : getApiAssetUrl(publicUrl);
          const thumbnailUrl = item.thumbnail_url ? getApiAssetUrl(item.thumbnail_url) : "";

          const placeholderImage = `data:image/svg+xml,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
                  <rect width="640" height="360" fill="#e6e8ec"/>
                  <circle cx="320" cy="164" r="42" fill="#ffffff"/>
                  <polygon points="306,142 306,186 342,164" fill="#5b3ce0"/>
                  <text x="320" y="252" text-anchor="middle"
                    font-family="Manrope, Arial" font-size="22" font-weight="700"
                    fill="#545a63">Family media</text>
                </svg>
              `)}`;

          const image = isYoutube
            ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
            : isPhoto
              ? assetUrl
              : thumbnailUrl || placeholderImage;

          return {
            id: assignedMediaId(item.id),
            title:
              item.title ||
              item.original_name ||
              item.filename ||
              (isPhoto ? "Family Photo" : "Family Video"),
            duration: isYoutube ? "YouTube" : isPhoto ? "Photo" : "Video",
            // Never invent a category name — an assigned item with no
            // category from the parent simply has none. It still surfaces
            // under "All", and photos also surface under the dedicated
            // "Photos" bucket (see KidsVideoHome's visibleCategories).
            category: item.category?.trim() || "",
            image,
            sourceType: isYoutube ? "youtube" : isPhoto ? "photo" : "upload",
            sourceUrl: assetUrl,
            youtubeVideoId,
            // Real values straight off the backend record — a card shows a
            // date only when the API actually sent one, and the byline names
            // where the item came from rather than inventing a channel.
            createdAt: item.created_at || undefined,
            sourceLabel: "Family library",
            // Real backend description when the parent wrote one; the watch
            // screen's expandable info panel shows it and omits the block
            // entirely when it is empty.
            description: item.description?.trim() || undefined,
            mediaId: String(item.id),
          };
        });

        setAssignedVideos(mapped);
      } catch (error) {
        if (cancelled) return;

        setAssignedVideos([]);
        setAssignedMediaError(
          error instanceof Error ? error.message : "Unable to load assigned media.",
        );
      } finally {
        if (!cancelled) setAssignedMediaLoading(false);
      }
    };

    loadAssignedVideos();

    return () => {
      cancelled = true;
    };
  }, [parentToken, profile?.id, assignedMediaRetryToken]);

  const [showAddProfile, setShowAddProfile] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [bedtimeActive, setBedtimeActive] = useState(false);

  // API health check (silent — just for logging)
  useEffect(() => {
    getApiHealth()
      .then((r) => console.log("API connected:", r.service))
      .catch((e: Error) => console.log("API unavailable:", e.message));
  }, []);

  const [customProfiles, setCustomProfiles] = useState<CreatedProfile[]>(() => {
    try {
      const saved = getStorageItem("sasa-custom-profiles");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [parentControls, setParentControls] = useState<ParentControlSettings>(() => {
    try {
      const saved = getStorageItem("sasa-parent-controls");
      if (!saved) return defaultParentControlSettings;
      return { ...defaultParentControlSettings, ...JSON.parse(saved) };
    } catch {
      return defaultParentControlSettings;
    }
  });

  /* Guests get no parent controls at all, so nothing may lock them out: the
   * defaults enable bedtime and a 90-minute screen limit, and with no
   * dashboard to reach there would be no way back. Signed-in parents keep
   * the full behaviour. */
  const parentControlsAvailable = Boolean(parentToken);

  const updateParentControls = (settings: ParentControlSettings) => {
    if (profile) {
      const expiryKey = `sasa-screen-expiry-${profile.id}`;
      const limitWasChanged =
        settings.screenMinutes !== parentControls.screenMinutes ||
        settings.screenLimitEnabled !== parentControls.screenLimitEnabled;
      const parentUnlockedDevice = parentControls.deviceLocked && !settings.deviceLocked;

      if (!settings.screenLimitEnabled) {
        localStorage.removeItem(expiryKey);
      } else if (limitWasChanged || parentUnlockedDevice || !localStorage.getItem(expiryKey)) {
        localStorage.setItem(expiryKey, String(Date.now() + settings.screenMinutes * 60 * 1000));
      }
    }
    // A parent toggling the switch is a different reason from the screen-time
    // timer tripping, and the lock screen has to tell them apart.
    const next: ParentControlSettings = { ...settings };
    if (settings.deviceLocked && !parentControls.deviceLocked) {
      next.lockReason = "parent";
    } else if (!settings.deviceLocked) {
      next.lockReason = null;
    }

    setParentControls(next);
    localStorage.setItem("sasa-parent-controls", JSON.stringify(next));
  };

  // Screen time enforcement
  useEffect(() => {
    if (!parentControlsAvailable) return;
    if (!profile || !parentControls.screenLimitEnabled || parentControls.deviceLocked) return;
    const expiryKey = `sasa-screen-expiry-${profile.id}`;
    const createExpiry = () => {
      const t = Date.now() + parentControls.screenMinutes * 60 * 1000;
      localStorage.setItem(expiryKey, String(t));
      return t;
    };
    if (!localStorage.getItem(expiryKey)) createExpiry();

    const checkScreenTime = () => {
      let expiryTime = Number(localStorage.getItem(expiryKey));
      if (!expiryTime || Number.isNaN(expiryTime)) expiryTime = createExpiry();
      if (Date.now() >= expiryTime) {
        const locked: ParentControlSettings = {
          ...parentControls,
          deviceLocked: true,
          lockReason: "screenTime",
        };
        setParentControls(locked);
        localStorage.setItem("sasa-parent-controls", JSON.stringify(locked));
      }
    };
    checkScreenTime();
    const interval = window.setInterval(checkScreenTime, 1000);
    return () => window.clearInterval(interval);
  }, [
    profile,
    parentControlsAvailable,
    parentControls.screenLimitEnabled,
    parentControls.screenMinutes,
    parentControls.deviceLocked,
  ]);

  // Bedtime enforcement
  useEffect(() => {
    const timeToMinutes = (v: string) => {
      const [h, m] = v.split(":").map(Number);
      return h * 60 + m;
    };
    const checkBedtime = () => {
      if (!parentControlsAvailable || !parentControls.bedtimeEnabled) {
        setBedtimeActive(false);
        return;
      }
      const now = new Date();
      const current = now.getHours() * 60 + now.getMinutes();
      const start = timeToMinutes(parentControls.bedtimeStart || "20:00");
      const end = timeToMinutes(parentControls.bedtimeEnd || "07:00");
      let active = false;
      if (start === end) active = true;
      else if (start < end) active = current >= start && current < end;
      else active = current >= start || current < end;
      setBedtimeActive(active);
    };
    checkBedtime();
    const interval = window.setInterval(checkBedtime, 1000);
    return () => window.clearInterval(interval);
  }, [
    parentControlsAvailable,
    parentControls.bedtimeEnabled,
    parentControls.bedtimeStart,
    parentControls.bedtimeEnd,
  ]);

  const openParentGate = () => {
    setShowParentDashboard(false);
    setShowParentGate(true);
  };

  // SARA_KIDS_PIN_V7 — shared between the "Who's Watching?" Manage PIN modal
  // (DatabaseProfileSelection) and the Parent Dashboard's per-child Change
  // PIN action (ParentDashboard) so both entry points update the same local
  // has_pin state consistently.
  const handleChildPinChanged = (childId: string) => {
    setDatabaseChildren((current) =>
      current.map((child) => (String(child.id) === childId ? { ...child, has_pin: true } : child)),
    );
  };
  const changeProfile = () => {
    setSelectedKidsVideo(null);
    setProfile(null);
  };

  // SARA_KIDS_ACTIVITY_V7 — real activity, recorded the moment a kid actually
  // opens a media item. See src/lib/activity.ts for why this is
  // localStorage-based rather than a backend call.
  const openKidsVideo = (video: KidsVideoItem) => {
    if (profile) {
      recordActivity({
        profileId: String(profile.id),
        profileName: profile.name,
        videoId: video.id,
        title: video.title,
        image: video.image,
        category: video.category,
        duration: video.duration,
        mediaType: video.sourceType || "built-in",
        kind: "opened",
      });
    }
    setSelectedKidsVideo(video);
  };

  // ── Screen priority ──────────────────────────────────────────────────────────

  const forceParentLogin =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("screen") === "parent-login";

  if (forceParentLogin || (!parentToken && !guestMode)) {
    return (
      <ParentLogin
        onSuccess={(token, name) => {
          localStorage.removeItem("sasa-account-mode");
          setGuestMode(false);
          setParentToken(token);
          setParentName(normalizeParentName(name));
        }}
        onGuest={() => {
          localStorage.setItem("sasa-account-mode", "guest");
          setGuestMode(true);
          setProfile(null);
          setSelectedKidsVideo(null);
        }}
      />
    );
  }

  if (showParentDashboard) {
    return (
      <ParentDashboard
        parentToken={parentToken}
        databaseChildren={databaseChildren}
        onDatabaseChildDeleted={(childId) => {
          setDatabaseChildren((current) => current.filter((child) => String(child.id) !== childId));

          if (profile != null && String(profile.id) === childId) {
            setProfile(null);
            setSelectedKidsVideo(null);
          }
        }}
        onChildPinChanged={handleChildPinChanged}
        settings={parentControls}
        profileId={profile?.id ?? null}
        profileName={profile?.name ?? "Child"}
        customProfiles={customProfiles}
        onDeleteCustomProfile={(profileId) => {
          const toDelete = customProfiles.find((c) => c.id === profileId);
          if (toDelete?.isProtected) {
            window.alert("Unprotect this profile before deleting it.");
            return;
          }
          const updated = customProfiles.filter((c) => c.id !== profileId);
          setCustomProfiles(updated);
          localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
          localStorage.removeItem(`sasa-screen-expiry-${profileId}`);
          try {
            removeActivityForProfile(String(profileId));
          } catch {
            /* keep app working */
          }
          if (profile?.id === profileId) {
            setProfile(null);
            setSelectedKidsVideo(null);
          }
        }}
        onUpdateCustomProfile={(updatedProfile) => {
          const updated = customProfiles.map((c) =>
            c.id === updatedProfile.id ? { ...c, ...updatedProfile } : c,
          );
          setCustomProfiles(updated);
          localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
          if (profile?.id === updatedProfile.id) {
            setProfile({
              id: updatedProfile.id,
              name: updatedProfile.name,
              emoji: updatedProfile.emoji,
              color: updatedProfile.color,
            });
          }
        }}
        onToggleProfileProtection={(profileId) => {
          const updated = customProfiles.map((c) =>
            c.id === profileId ? { ...c, isProtected: !c.isProtected } : c,
          );
          setCustomProfiles(updated);
          localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
        }}
        onSettingsChange={updateParentControls}
        onClose={() => {
          setShowParentDashboard(false);
          setShowParentGate(false);
        }}
      />
    );
  }

  if (showParentGate) {
    return (
      <ParentalGate
        parentPin={parentControls.parentPin}
        requireParentPin={parentControls.requireParentPin}
        onSuccess={() => {
          setShowParentGate(false);
          setShowParentDashboard(true);
        }}
        onCancel={() => setShowParentGate(false)}
      />
    );
  }

  if (parentControlsAvailable && (parentControls.deviceLocked || bedtimeActive) && profile) {
    // An explicit lock outranks bedtime: bedtime clears itself in the morning,
    // a stored lock needs a grown-up, so that is the more useful thing to say.
    const lockReason: LockScreenReason = parentControls.deviceLocked
      ? (parentControls.lockReason ?? "parent")
      : "bedtime";

    return (
      <DeviceLocked
        reason={lockReason}
        bedtimeEnd={parentControls.bedtimeEnd}
        screenMinutes={parentControls.screenMinutes}
        childName={profile.name}
        onParentUnlock={openParentGate}
        onChangeProfile={changeProfile}
      />
    );
  }

  if (!profile && showAddProfile) {
    return (
      <AddProfile
        onClose={() => setShowAddProfile(false)}
        onCreate={(createdProfile) => {
          const updated = [...customProfiles, createdProfile];
          setCustomProfiles(updated);
          localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
          setShowAddProfile(false);
        }}
      />
    );
  }

  if (!profile && parentToken) {
    return (
      <DatabaseProfileSelection
        token={parentToken}
        children={databaseChildren}
        loading={databaseChildrenLoading}
        error={databaseChildrenError}
        parentName={parentName}
        onOpenParentControls={openParentGate}
        onRetry={() => loadDatabaseChildren(parentToken)}
        onChildCreated={(child) => {
          setDatabaseChildren((current) => [...current, child]);
        }}
        onChildPinChanged={handleChildPinChanged}
        onLogout={() => {
          localStorage.removeItem("sasa-parent-token");
          localStorage.removeItem("sasa-parent-name");
          setParentToken(null);
          setParentName("Parent");
          setDatabaseChildren([]);
          setProfile(null);
        }}
        onSelectChild={(child) => {
          const savedImage =
            child.avatar_url || localStorage.getItem(`sasa-child-image-${child.id}`) || undefined;

          setProfile({
            id: child.id,
            name: child.display_name,
            emoji: getDatabaseProfileEmoji(child.id),
            color: getDatabaseProfileColor(child.id),
            image: savedImage,
          });

          setSelectedKidsVideo(null);
        }}
      />
    );
  }

  if (!profile) {
    return (
      <>
        {guestMode && !parentToken && (
          <FreeAccountBanner
            onCreateAccount={() => {
              localStorage.removeItem("sasa-account-mode");
              setGuestMode(false);
              setProfile(null);
              setSelectedKidsVideo(null);
            }}
          />
        )}
        <ProfileSelection
          customProfiles={customProfiles}
          onSelectProfile={(name, emoji, color, id, image) => {
            const imageStorageKey = `sasa-child-image-${id}`;

            const savedImage = image || localStorage.getItem(imageStorageKey) || undefined;

            setProfile({
              id,
              name,
              emoji,
              color,
              image: savedImage,
            });

            if (image) {
              localStorage.setItem(imageStorageKey, image);
            } else if (!savedImage) {
              localStorage.removeItem(imageStorageKey);
            }
            localStorage.setItem("sasa-active-kid-emoji", emoji);
            localStorage.setItem("sasa-active-kid-name", name);
            if (parentControls.screenLimitEnabled) {
              localStorage.setItem(
                `sasa-screen-expiry-${id}`,
                String(Date.now() + parentControls.screenMinutes * 60 * 1000),
              );
            }
            setSelectedKidsVideo(null);
          }}
          onAddProfile={() => setShowAddProfile(true)}
          onLogin={() => {
            localStorage.removeItem("sasa-account-mode");
            localStorage.removeItem("sasa-parent-token");
            localStorage.removeItem("sasa-parent-name");
            localStorage.removeItem("sasa-parent-role");
            localStorage.removeItem("sasa-active-kid-name");
            localStorage.removeItem("sasa-active-kid-emoji");
            setParentToken(null);
            setParentName("Parent");
            setDatabaseChildren([]);
            setGuestMode(false);
            setProfile(null);
            setSelectedKidsVideo(null);
          }}
        />
      </>
    );
  }

  if (selectedKidsVideo) {
    return (
      <KidsVideoPlayer
        video={selectedKidsVideo}
        profileId={profile?.id}
        profileName={profile?.name}
        profileEmoji={profile?.emoji}
        customProfiles={customProfiles}
        playlist={feedMedia}
        onBack={() => {
          setHomeTab("home");
          setSelectedKidsVideo(null);
        }}
        onOpenVideo={openKidsVideo}
        onOpenHomeTab={(tab) => {
          setHomeTab(tab);
          setSelectedKidsVideo(null);
        }}
        onChangeProfile={changeProfile}
      />
    );
  }

  return (
    // AppShell (rendered by KidsVideoHome) owns the page min-height, the
    // safe-area insets and the bottom-navigation clearance. A second
    // min-height wrapper here used to leave stray scrollable whitespace
    // below the fold on mobile browsers.
    <KidsVideoHome
      assignedVideos={feedMedia}
      assignedVideosLoading={assignedMediaLoading || publicMediaLoading}
      assignedMediaError={assignedMediaError}
      onRetryAssignedMedia={() => setAssignedMediaRetryToken((value) => value + 1)}
      profileName={profile.name}
      profileEmoji={profile.emoji}
      profileId={profile.id}
      profileImage={profile.image}
      isAdmin={isAdmin}
      {...(typeof profile.id === "string" && parentToken
        ? {
            avatarToken: parentToken,
            databaseProfileId: profile.id,
            onAvatarSaved: (avatarUrl: string) => {
              /* Update the profile that is on screen as well as re-reading the
               * family list. Without the first part the chooser saved
               * correctly but the header kept showing the old picture until a
               * reload, which reads as the save not having worked. */
              setProfile((current) =>
                current
                  ? {
                      ...current,
                      ...(avatarUrl.startsWith("emoji:")
                        ? { emoji: avatarUrl.slice("emoji:".length), image: undefined }
                        : { image: profileAvatarUrl(String(current.id)) }),
                    }
                  : current,
              );

              if (parentToken) loadDatabaseChildren(parentToken);
            },
          }
        : {})}
      activeTab={homeTab}
      onTabChange={setHomeTab}
      onOpenVideo={openKidsVideo}
      onOpenParentalControls={openParentGate}
      onChangeProfile={changeProfile}
      onOpenFreeAccount={
        guestMode && !parentToken
          ? () => {
              localStorage.removeItem("sasa-account-mode");
              setGuestMode(false);
              setProfile(null);
              setSelectedKidsVideo(null);
            }
          : undefined
      }
      accountActionLabel={parentToken ? "Sign Out" : "Login"}
      onAccountAction={() => {
        if (parentToken) {
          localStorage.removeItem("sasa-parent-token");
          localStorage.removeItem("sasa-parent-name");
          localStorage.removeItem("sasa-parent-role");
          localStorage.removeItem("sasa-account-mode");
          setParentToken(null);
          setParentName("Parent");
          setDatabaseChildren([]);
          setProfile(null);
          setSelectedKidsVideo(null);
          return;
        }

        localStorage.removeItem("sasa-account-mode");
        setGuestMode(false);
        setProfile(null);
        setSelectedKidsVideo(null);
      }}
    />
  );
}
