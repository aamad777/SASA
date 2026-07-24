import { useEffect, useState } from 'react';

import AddProfile, {
  type CreatedProfile,
} from './components/AddProfile';
import DeviceLocked from './components/DeviceLocked';
import DatabaseProfileSelection, {
  getDatabaseProfileColor,
  getDatabaseProfileEmoji,
} from './components/DatabaseProfileSelection';
import KidsVideoHome, {
  type KidsHomeTab,
  type KidsVideoItem,
} from './components/KidsVideoHome';
import KidsVideoPlayer from './components/KidsVideoPlayer';
import ParentalGate from './components/ParentalGate';
import ParentLogin from './components/ParentLogin';
import ParentDashboard, {
  defaultParentControlSettings,
  type ParentControlSettings,
} from './components/ParentDashboard';
import ProfileSelection from './components/ProfileSelection';
import AdminDashboard from './components/AdminDashboard';
import {
  getApiHealth,
  getChildren,
  type DatabaseChild,
} from './lib/api';

type Profile = {
  id: number;
  name: string;
  emoji: string;
  color: string;
};


function getAccountRoleFromToken(
  token: string | null,
): 'parent' | 'admin' {
  if (!token) {
    return 'parent';
  }

  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return 'parent';
    }

    const normalizedPayload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const paddedPayload =
      normalizedPayload +
      '='.repeat(
        (4 - (normalizedPayload.length % 4)) % 4,
      );

    const payload = JSON.parse(
      window.atob(paddedPayload),
    );

    return payload.role === 'admin'
      ? 'admin'
      : 'parent';
  } catch {
    return 'parent';
  }
}

export default function App() {
  const [parentToken, setParentToken] =
    useState<string | null>(() =>
      localStorage.getItem('sasa-parent-token'),
    );

  const [guestMode, setGuestMode] =
    useState(() =>
      localStorage.getItem('sasa-account-mode') ===
      'guest',
    );

  const [parentName, setParentName] =
    useState(() =>
      localStorage.getItem('sasa-parent-name') ||
      'Parent',
    );

  const [databaseChildren, setDatabaseChildren] =
    useState<DatabaseChild[]>([]);

  const [databaseChildrenLoading, setDatabaseChildrenLoading] =
    useState(false);

  const [databaseChildrenError, setDatabaseChildrenError] =
    useState('');

  const loadDatabaseChildren = async (
    token: string,
  ) => {
    setDatabaseChildrenLoading(true);
    setDatabaseChildrenError('');

    try {
      const children = await getChildren(token);
      setDatabaseChildren(children);
    } catch (error) {
      setDatabaseChildrenError(
        error instanceof Error
          ? error.message
          : 'Unable to load child profiles.',
      );
    } finally {
      setDatabaseChildrenLoading(false);
    }
  };

  useEffect(() => {
    if (parentToken) {
      loadDatabaseChildren(parentToken);
    }
  }, [parentToken]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedKidsVideo, setSelectedKidsVideo] =
    useState<KidsVideoItem | null>(null);
  const [homeTab, setHomeTab] =
    useState<KidsHomeTab>('home');

  const [showAddProfile, setShowAddProfile] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);
  const [showParentDashboard, setShowParentDashboard] =
    useState(false);
  const [bedtimeActive, setBedtimeActive] =
    useState(false);

  const [apiStatus, setApiStatus] =
    useState('Checking API...');

  useEffect(() => {
    getApiHealth()
      .then((result) => {
        setApiStatus(
          `API connected: ${result.service}`,
        );
      })
      .catch((error: Error) => {
        setApiStatus(
          `API unavailable: ${error.message}`,
        );
      });
  }, []);

  const [customProfiles, setCustomProfiles] =
    useState<CreatedProfile[]>(() => {
      try {
        const saved = localStorage.getItem(
          'sasa-custom-profiles',
        );

        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    });

  const [parentControls, setParentControls] =
    useState<ParentControlSettings>(() => {
      try {
        const saved = localStorage.getItem(
          'sasa-parent-controls',
        );

        if (!saved) {
          return defaultParentControlSettings;
        }

        return {
          ...defaultParentControlSettings,
          ...JSON.parse(saved),
        };
      } catch {
        return defaultParentControlSettings;
      }
    });

  const updateParentControls = (
    settings: ParentControlSettings,
  ) => {
    if (profile) {
      const expiryKey =
        `sasa-screen-expiry-${profile.id}`;

      const limitWasChanged =
        settings.screenMinutes !==
          parentControls.screenMinutes ||
        settings.screenLimitEnabled !==
          parentControls.screenLimitEnabled;

      const parentUnlockedDevice =
        parentControls.deviceLocked &&
        !settings.deviceLocked;

      if (!settings.screenLimitEnabled) {
        localStorage.removeItem(expiryKey);
      } else if (
        limitWasChanged ||
        parentUnlockedDevice ||
        !localStorage.getItem(expiryKey)
      ) {
        const expiryTime =
          Date.now() +
          settings.screenMinutes * 60 * 1000;

        localStorage.setItem(
          expiryKey,
          String(expiryTime),
        );
      }
    }

    setParentControls(settings);

    localStorage.setItem(
      'sasa-parent-controls',
      JSON.stringify(settings),
    );
  };

  useEffect(() => {
    if (
      !profile ||
      !parentControls.screenLimitEnabled ||
      parentControls.deviceLocked
    ) {
      return;
    }

    const expiryKey =
      `sasa-screen-expiry-${profile.id}`;

    const createExpiry = () => {
      const expiryTime =
        Date.now() +
        parentControls.screenMinutes * 60 * 1000;

      localStorage.setItem(
        expiryKey,
        String(expiryTime),
      );

      return expiryTime;
    };

    if (!localStorage.getItem(expiryKey)) {
      createExpiry();
    }

    const checkScreenTime = () => {
      let expiryTime = Number(
        localStorage.getItem(expiryKey),
      );

      if (!expiryTime || Number.isNaN(expiryTime)) {
        expiryTime = createExpiry();
      }

      if (Date.now() >= expiryTime) {
        const lockedSettings = {
          ...parentControls,
          deviceLocked: true,
        };

        setParentControls(lockedSettings);

        localStorage.setItem(
          'sasa-parent-controls',
          JSON.stringify(lockedSettings),
        );
      }
    };

    checkScreenTime();

    const interval = window.setInterval(
      checkScreenTime,
      1000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [
    profile,
    parentControls.screenLimitEnabled,
    parentControls.screenMinutes,
    parentControls.deviceLocked,
  ]);

  useEffect(() => {
    const timeToMinutes = (value: string) => {
      const [hours, minutes] = value
        .split(':')
        .map(Number);

      return hours * 60 + minutes;
    };

    const checkBedtime = () => {
      if (!parentControls.bedtimeEnabled) {
        setBedtimeActive(false);
        return;
      }

      const now = new Date();
      const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

      const startMinutes = timeToMinutes(
        parentControls.bedtimeStart || '20:00',
      );

      const endMinutes = timeToMinutes(
        parentControls.bedtimeEnd || '07:00',
      );

      let active = false;

      if (startMinutes === endMinutes) {
        active = true;
      } else if (startMinutes < endMinutes) {
        active =
          currentMinutes >= startMinutes &&
          currentMinutes < endMinutes;
      } else {
        active =
          currentMinutes >= startMinutes ||
          currentMinutes < endMinutes;
      }

      setBedtimeActive(active);
    };

    checkBedtime();

    const interval = window.setInterval(
      checkBedtime,
      1000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [
    parentControls.bedtimeEnabled,
    parentControls.bedtimeStart,
    parentControls.bedtimeEnd,
  ]);

  const openParentGate = () => {
    setShowParentDashboard(false);
    setShowParentGate(true);
  };

  const changeProfile = () => {
    setSelectedKidsVideo(null);
    setProfile(null);
  };

  const openKidsVideo = (video: KidsVideoItem) => {
    if (profile) {
      const historyKey = 'sasa-watch-history';

      try {
        const saved = localStorage.getItem(historyKey);
        const parsed = saved ? JSON.parse(saved) : [];
        const existing = Array.isArray(parsed)
          ? parsed
          : [];

        const historyEntry = {
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

        const updated = [
          historyEntry,
          ...existing,
        ].slice(0, 300);

        localStorage.setItem(
          historyKey,
          JSON.stringify(updated),
        );
      } catch {
        localStorage.setItem(
          historyKey,
          JSON.stringify([
            {
              historyId:
                `${Date.now()}-${profile.id}-${video.id}`,
              profileId: profile.id,
              profileName: profile.name,
              videoId: video.id,
              title: video.title,
              image: video.image,
              category: video.category,
              duration: video.duration,
              watchedAt: new Date().toISOString(),
            },
          ]),
        );
      }
    }

    setSelectedKidsVideo(video);
  };

  console.log(apiStatus, parentName);

  if (!parentToken && !guestMode) {
    return (
      <ParentLogin
        onSuccess={(token, name) => {
          localStorage.removeItem(
            'sasa-account-mode',
          );

          setGuestMode(false);
          setParentToken(token);
          setParentName(name);
        }}
        onGuest={() => {
          localStorage.setItem(
            'sasa-account-mode',
            'guest',
          );

          setGuestMode(true);
          setProfile(null);
          setSelectedKidsVideo(null);
        }}
      />
    );
  }

  /*
   * Screen priority:
   * 1. Parent dashboard
   * 2. Parent gate
   * 3. Locked screen
   * 4. Add profile
   * 5. Profile selection
   * 6. Video player
   * 7. Video home
   */

  if (showParentDashboard) {
    return (
      <ParentDashboard
        settings={parentControls}
        profileId={profile?.id ?? null}
        profileName={profile?.name ?? 'Child'}
        customProfiles={customProfiles}
        onDeleteCustomProfile={(profileId) => {
          const profileToDelete =
            customProfiles.find(
              (child) => child.id === profileId,
            );

          if (profileToDelete?.isProtected) {
            window.alert(
              'Unprotect this profile before deleting it.',
            );
            return;
          }

          const updatedProfiles =
            customProfiles.filter(
              (child) => child.id !== profileId,
            );

          setCustomProfiles(updatedProfiles);

          localStorage.setItem(
            'sasa-custom-profiles',
            JSON.stringify(updatedProfiles),
          );

          localStorage.removeItem(
            `sasa-screen-expiry-${profileId}`,
          );

          const savedHistory =
            localStorage.getItem(
              'sasa-watch-history',
            );

          if (savedHistory) {
            try {
              const parsed = JSON.parse(savedHistory);

              const remainingHistory =
                Array.isArray(parsed)
                  ? parsed.filter(
                      (item) =>
                        Number(item.profileId) !==
                        Number(profileId),
                    )
                  : [];

              localStorage.setItem(
                'sasa-watch-history',
                JSON.stringify(remainingHistory),
              );
            } catch {
              // Keep the application working even if
              // old history data is invalid.
            }
          }

          if (profile?.id === profileId) {
            setProfile(null);
            setSelectedKidsVideo(null);
          }
        }}
        onUpdateCustomProfile={(updatedProfile) => {
          const updatedProfiles =
            customProfiles.map((child) =>
              child.id === updatedProfile.id
                ? {
                    ...child,
                    ...updatedProfile,
                  }
                : child,
            );

          setCustomProfiles(updatedProfiles);

          localStorage.setItem(
            'sasa-custom-profiles',
            JSON.stringify(updatedProfiles),
          );

          if (
            profile?.id === updatedProfile.id
          ) {
            setProfile({
              id: updatedProfile.id,
              name: updatedProfile.name,
              emoji: updatedProfile.emoji,
              color: updatedProfile.color,
            });
          }
        }}
        onToggleProfileProtection={(profileId) => {
          const updatedProfiles =
            customProfiles.map((child) =>
              child.id === profileId
                ? {
                    ...child,
                    isProtected:
                      !child.isProtected,
                  }
                : child,
            );

          setCustomProfiles(updatedProfiles);

          localStorage.setItem(
            'sasa-custom-profiles',
            JSON.stringify(updatedProfiles),
          );
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
        requireParentPin={
          parentControls.requireParentPin
        }
        onSuccess={() => {
          setShowParentGate(false);
          setShowParentDashboard(true);
        }}
        onCancel={() => {
          setShowParentGate(false);
        }}
      />
    );
  }

  if (
    (parentControls.deviceLocked || bedtimeActive) &&
    profile
  ) {
    return (
      <DeviceLocked
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
          const updatedProfiles = [
            ...customProfiles,
            createdProfile,
          ];

          setCustomProfiles(updatedProfiles);

          localStorage.setItem(
            'sasa-custom-profiles',
            JSON.stringify(updatedProfiles),
          );

          setShowAddProfile(false);
        }}
      />
    );
  }

  if (
    parentToken &&
    getAccountRoleFromToken(parentToken) === 'admin'
  ) {
    return (
      <AdminDashboard
        token={parentToken}
        adminName={parentName}
        onLogout={() => {
          localStorage.removeItem(
            'sasa-parent-token',
          );

          localStorage.removeItem(
            'sasa-parent-name',
          );

          localStorage.removeItem(
            'sasa-parent-role',
          );

          setParentToken(null);
          setParentName('Parent');
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
        onRetry={() =>
          loadDatabaseChildren(parentToken)
        }
        onLogout={() => {
          localStorage.removeItem(
            'sasa-parent-token',
          );

          localStorage.removeItem(
            'sasa-parent-name',
          );

          setParentToken(null);
          setParentName('Parent');
          setDatabaseChildren([]);
          setProfile(null);
        }}
        onSelectChild={(child) => {
          setProfile({
            id: child.id,
            name: child.display_name,
            emoji:
              getDatabaseProfileEmoji(child.id),
            color:
              getDatabaseProfileColor(child.id),
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
          <div className="guest-account-banner">
            <div>
              <strong>Continue with a free account</strong>
              <span>
                Create an account to save child profiles,
                controls, history, and settings.
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(
                  'sasa-account-mode',
                );

                setGuestMode(false);
                setProfile(null);
                setSelectedKidsVideo(null);
              }}
            >
              Create Account
            </button>
          </div>
        )}

        <ProfileSelection
          customProfiles={customProfiles}
        onSelectProfile={(name, emoji, color, id) => {
          setProfile({
            id,
            name,
            emoji,
            color,
          });

          if (parentControls.screenLimitEnabled) {
            localStorage.setItem(
              `sasa-screen-expiry-${id}`,
              String(
                Date.now() +
                  parentControls.screenMinutes *
                    60 *
                    1000,
              ),
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
        onBack={() => {
          setHomeTab('home');
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
    <KidsVideoHome
      key={homeTab}
      profileName={profile.name}
      profileEmoji={profile.emoji}
      initialTab={homeTab}
      onOpenVideo={openKidsVideo}
      onOpenParentalControls={openParentGate}
      onChangeProfile={changeProfile}
    />
  );
}
