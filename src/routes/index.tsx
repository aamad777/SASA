import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import AddProfile, {
  type CreatedProfile,
} from "@/components/AddProfile";
import DeviceLocked from "@/components/DeviceLocked";
import DatabaseProfileSelection, {
  getDatabaseProfileColor,
  getDatabaseProfileEmoji,
} from "@/components/DatabaseProfileSelection";
import KidsVideoHome, {
  type KidsHomeTab,
  type KidsVideoItem,
} from "@/components/KidsVideoHome";
import KidsVideoPlayer from "@/components/KidsVideoPlayer";
import ParentalGate from "@/components/ParentalGate";
import ParentLogin from "@/components/ParentLogin";
import ParentDashboard, {
  defaultParentControlSettings,
  type ParentControlSettings,
} from "@/components/ParentDashboard";
import ProfileSelection from "@/components/ProfileSelection";
import AdminDashboard from "@/components/AdminDashboard";
import FreeAccountBanner from "@/components/FreeAccountBanner";
import {
  getApiHealth,
  getChildren,
  type DatabaseChild,
} from "@/lib/api";

export const Route = createFileRoute("/")(
  { component: SasaApp }
);

type Profile = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  image?: string;
};

function getAccountRoleFromToken(token: string | null): "parent" | "admin" {
  if (!token) return "parent";
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return "parent";
    const normalizedPayload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload =
      normalizedPayload + "=".repeat((4 - (normalizedPayload.length % 4)) % 4);
    const payload = JSON.parse(window.atob(paddedPayload));
    return payload.role === "admin" ? "admin" : "parent";
  } catch {
    return "parent";
  }
}

function SasaApp() {
  const [parentToken, setParentToken] = useState<string | null>(() =>
    typeof localStorage !== "undefined"
      ? localStorage.getItem("sasa-parent-token")
      : null
  );

  const [guestMode, setGuestMode] = useState(() =>
    typeof localStorage !== "undefined"
      ? localStorage.getItem("sasa-account-mode") === "guest"
      : false
  );

  const [parentName, setParentName] = useState(() =>
    typeof localStorage !== "undefined"
      ? localStorage.getItem("sasa-parent-name") || "Parent"
      : "Parent"
  );

  const [databaseChildren, setDatabaseChildren] = useState<DatabaseChild[]>([]);
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
        error instanceof Error ? error.message : "Unable to load child profiles."
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
  const [homeTab, setHomeTab] = useState<KidsHomeTab>("home");

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
      const saved =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("sasa-custom-profiles")
          : null;
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [parentControls, setParentControls] = useState<ParentControlSettings>(() => {
    try {
      const saved =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("sasa-parent-controls")
          : null;
      if (!saved) return defaultParentControlSettings;
      return { ...defaultParentControlSettings, ...JSON.parse(saved) };
    } catch {
      return defaultParentControlSettings;
    }
  });

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
    setParentControls(settings);
    localStorage.setItem("sasa-parent-controls", JSON.stringify(settings));
  };

  // Screen time enforcement
  useEffect(() => {
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
        const locked = { ...parentControls, deviceLocked: true };
        setParentControls(locked);
        localStorage.setItem("sasa-parent-controls", JSON.stringify(locked));
      }
    };
    checkScreenTime();
    const interval = window.setInterval(checkScreenTime, 1000);
    return () => window.clearInterval(interval);
  }, [
    profile,
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
      if (!parentControls.bedtimeEnabled) { setBedtimeActive(false); return; }
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
  }, [parentControls.bedtimeEnabled, parentControls.bedtimeStart, parentControls.bedtimeEnd]);

  const openParentGate = () => { setShowParentDashboard(false); setShowParentGate(true); };
  const changeProfile = () => { setSelectedKidsVideo(null); setProfile(null); };

  const openKidsVideo = (video: KidsVideoItem) => {
    if (profile) {
      const historyKey = "sasa-watch-history";
      try {
        const saved = localStorage.getItem(historyKey);
        const existing = Array.isArray(saved ? JSON.parse(saved) : [])
          ? (saved ? JSON.parse(saved) : [])
          : [];
        const entry = {
          historyId: `${Date.now()}-${profile.id}-${video.id}`,
          profileId: profile.id,
          profileName: profile.name,
          videoId: video.id,
          title: video.title,
          image: video.image,
          category: video.category,
          duration: video.duration,
          watchedAt: new Date().toISOString(),
        };
        localStorage.setItem(historyKey, JSON.stringify([entry, ...existing].slice(0, 300)));
      } catch {
        localStorage.setItem(
          historyKey,
          JSON.stringify([{
            historyId: `${Date.now()}-${profile.id}-${video.id}`,
            profileId: profile.id, profileName: profile.name,
            videoId: video.id, title: video.title, image: video.image,
            category: video.category, duration: video.duration,
            watchedAt: new Date().toISOString(),
          }])
        );
      }
    }
    setSelectedKidsVideo(video);
  };

  // ── Screen priority ──────────────────────────────────────────────────────────

  if (!parentToken && !guestMode) {
    return (
      <ParentLogin
        onSuccess={(token, name) => {
          localStorage.removeItem("sasa-account-mode");
          setGuestMode(false);
          setParentToken(token);
          setParentName(name);
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
        settings={parentControls}
        profileId={profile?.id ?? null}
        profileName={profile?.name ?? "Child"}
        customProfiles={customProfiles}
        onDeleteCustomProfile={(profileId) => {
          const toDelete = customProfiles.find((c) => c.id === profileId);
          if (toDelete?.isProtected) { window.alert("Unprotect this profile before deleting it."); return; }
          const updated = customProfiles.filter((c) => c.id !== profileId);
          setCustomProfiles(updated);
          localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
          localStorage.removeItem(`sasa-screen-expiry-${profileId}`);
          const savedHistory = localStorage.getItem("sasa-watch-history");
          if (savedHistory) {
            try {
              const parsed = JSON.parse(savedHistory);
              const remaining = Array.isArray(parsed)
                ? parsed.filter((item) => Number(item.profileId) !== Number(profileId))
                : [];
              localStorage.setItem("sasa-watch-history", JSON.stringify(remaining));
            } catch { /* keep app working */ }
          }
          if (profile?.id === profileId) { setProfile(null); setSelectedKidsVideo(null); }
        }}
        onUpdateCustomProfile={(updatedProfile) => {
          const updated = customProfiles.map((c) =>
            c.id === updatedProfile.id ? { ...c, ...updatedProfile } : c
          );
          setCustomProfiles(updated);
          localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
          if (profile?.id === updatedProfile.id) {
            setProfile({ id: updatedProfile.id, name: updatedProfile.name, emoji: updatedProfile.emoji, color: updatedProfile.color });
          }
        }}
        onToggleProfileProtection={(profileId) => {
          const updated = customProfiles.map((c) =>
            c.id === profileId ? { ...c, isProtected: !c.isProtected } : c
          );
          setCustomProfiles(updated);
          localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
        }}
        onSettingsChange={updateParentControls}
        onClose={() => { setShowParentDashboard(false); setShowParentGate(false); }}
      />
    );
  }

  if (showParentGate) {
    return (
      <ParentalGate
        parentPin={parentControls.parentPin}
        requireParentPin={parentControls.requireParentPin}
        onSuccess={() => { setShowParentGate(false); setShowParentDashboard(true); }}
        onCancel={() => setShowParentGate(false)}
      />
    );
  }

  if ((parentControls.deviceLocked || bedtimeActive) && profile) {
    return <DeviceLocked onParentUnlock={openParentGate} onChangeProfile={changeProfile} />;
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

  if (parentToken && getAccountRoleFromToken(parentToken) === "admin") {
    return (
      <AdminDashboard
        token={parentToken}
        adminName={parentName}
        onLogout={() => {
          localStorage.removeItem("sasa-parent-token");
          localStorage.removeItem("sasa-parent-name");
          localStorage.removeItem("sasa-parent-role");
          setParentToken(null);
          setParentName("Parent");
          setDatabaseChildren([]);
          setProfile(null);
        }}
      />
    );
  }

  if (!profile && parentToken) {
    return (
      <DatabaseProfileSelection
        children={databaseChildren}
        loading={databaseChildrenLoading}
        error={databaseChildrenError}
        parentName={parentName}
        onRetry={() => loadDatabaseChildren(parentToken)}
        onLogout={() => {
          localStorage.removeItem("sasa-parent-token");
          localStorage.removeItem("sasa-parent-name");
          setParentToken(null);
          setParentName("Parent");
          setDatabaseChildren([]);
          setProfile(null);
        }}
        onSelectChild={(child) => {
          setProfile({
            id: child.id,
            name: child.display_name,
            emoji: getDatabaseProfileEmoji(child.id),
            color: getDatabaseProfileColor(child.id),
          });
          setSelectedKidsVideo(null);
        }}
      />
    );
  }

  if (!profile) {
    return (
      <>
        {guestMode && (
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
            setProfile({ id, name, emoji, color, image });
            if (image) localStorage.setItem("sasa-active-kid-image", image);
            else localStorage.removeItem("sasa-active-kid-image");
            localStorage.setItem("sasa-active-kid-emoji", emoji);
            localStorage.setItem("sasa-active-kid-name", name);
            if (parentControls.screenLimitEnabled) {
              localStorage.setItem(
                `sasa-screen-expiry-${id}`,
                String(Date.now() + parentControls.screenMinutes * 60 * 1000)
              );
            }
            setSelectedKidsVideo(null);
          }}
          onOpenParentalControls={openParentGate}
          onAddProfile={() => setShowAddProfile(true)}
        />
      </>
    );
  }

  if (selectedKidsVideo) {
    return (
      <KidsVideoPlayer
        video={selectedKidsVideo}
        profileName={profile?.name}
        profileEmoji={profile?.emoji}
        customProfiles={customProfiles}
        onBack={() => { setHomeTab("home"); setSelectedKidsVideo(null); }}
        onOpenVideo={openKidsVideo}
        onOpenHomeTab={(tab) => { setHomeTab(tab); setSelectedKidsVideo(null); }}
        onChangeProfile={changeProfile}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <KidsVideoHome
        profileName={profile.name}
        profileEmoji={profile.emoji}
        profileImage={profile.image}
        activeTab={homeTab}
        onTabChange={setHomeTab}
        onOpenVideo={openKidsVideo}
        onOpenParentalControls={openParentGate}
        onChangeProfile={changeProfile}
        onOpenFreeAccount={
          guestMode
            ? () => {
                localStorage.removeItem("sasa-account-mode");
                setGuestMode(false);
                setProfile(null);
                setSelectedKidsVideo(null);
              }
            : undefined
        }
      />
    </div>
  );
}
