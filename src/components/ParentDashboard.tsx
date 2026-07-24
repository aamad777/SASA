import { useEffect, useState } from 'react';
import { kidsVideos } from './KidsVideoHome';
import {
  BarChart3,
  Bed,
  Bell,
  BookOpen,
  Clock3,
  Home,
  Library,
  Lock,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  Shield,
  Timer,
  UserCircle,
  X,
} from 'lucide-react';

export type BlockedChannel = {
  id: number;
  name: string;
  image: string;
};

export type ParentControlSettings = {
  screenLimitEnabled: boolean;
  screenMinutes: number;
  bedtimeEnabled: boolean;
  bedtimeStart: string;
  bedtimeEnd: string;
  deviceLocked: boolean;
  blockedChannels: BlockedChannel[];
  blockedVideoIds: number[];
  parentPin: string;
  requireParentPin: boolean;
};

type WatchHistoryItem = {
  historyId: string;
  profileId: number;
  profileName: string;
  videoId: number;
  title: string;
  image: string;
  category: string;
  duration: string;
  watchedAt: string;
};

type ManagedCustomProfile = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  age?: number;
  isProtected?: boolean;
};

type ParentDashboardProps = {
  customProfiles: ManagedCustomProfile[];
  onDeleteCustomProfile: (profileId: number) => void;
  onUpdateCustomProfile: (
    profile: ManagedCustomProfile,
  ) => void;
  onToggleProfileProtection: (
    profileId: number,
  ) => void;
  onClose: () => void;
  settings: ParentControlSettings;
  profileId: number | null;
  profileName: string;
  onSettingsChange: (settings: ParentControlSettings) => void;
};

const historyItems = [
  {
    id: 1,
    title: 'Peppa Pig: Muddy Puddles',
    watched: '10m ago',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_XNMAxsUTBKZmh1ejMzKmmL6hQC4jFZvo7bTnfsSFPA1yOt7GLpxsTbjU_SkjawV0GVfdd79-an-CEi5yzse3mVw_P8M4_XITJiGupnCSkqt4vTPs1gIz-HZ7wyLgHEm6W1KJG-20vFJ7oj9hwuyRqG-bjqgOFUEI7XJTUwfoY_XSc_9zOqtrWyANG9mymfvev6_34tfeT1MzYDwgDAzDN4CWqjld4CwpT5rO2MSfQ97aaB63TC1XVVKxN2rxilt6u67kXSJVtR8',
  },
  {
    id: 2,
    title: 'Cocomelon: Bath Song',
    watched: '25m ago',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-wiB4yWnYIg2a7UXCzWONngOSx0l07EKXMERr7wyfA_kqrh4ih2vP24rYFAevIKp6MoMJSfzLS9fXg_jCGPwvjOJTUJZkUBulJ2I4fVuuDsyIgvGBv8N9TTnTw1yUUmsEL56hGWdi9gV4iPMbcfEiDe8xGxEeWAgfgTJFUhc4lFqXXGOSx_3_j_A7g6Hjil2Mz2azQJYapIIfsmQalLyDwYaukUE5ZdbvPfIDFNBkxsD6ZXBuv4nlnxZCijrqUNKsVc18I3Iq7DU',
  },
  {
    id: 3,
    title: 'Bluey: The Pooch',
    watched: '1h ago',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCqHn6Ilvqma_Z7cukIpg63qFn-VYpUefNCOE1ti4X4jZ_oNszZQ6mfHbuIzTRxGsS-ylmNqjnBZNANPt_hHJ3Z3CDRpz66DRzfAB0Iq_XA_pK3WORC-42sFaW8K_vxftFft19mzEUv5xyWkblVhpU1Zqi_fpPKsRqrzcmK65z5mZYKn9mPi5llp3L6FIsr-Sdl8t7G9g84oTJf4jpCWy63IAcU4t7MpWiSbyQHoFKdhXfOrluR53c7MZ4oVyUoFVibFTiCtfBO0-o',
  },
];

export const initialBlockedChannels: BlockedChannel[] = [
  {
    id: 1,
    name: "Ryan's World",
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC8h0FQFA_8laRvvyvA_y-9UW7CQCVYZOXp05jh6hY9RzIIKuCFjHFgJF2sH0mJJu-6QAScLVnpDSc5Qqt45FLvRuiEXkfhW1f0PUdmLaaNfdUg_ETpRcasrArWIqd6UAJaTlS23T7Xv6FHJl52qK_Ne18bS5vRBf-KECJGXoDXJ4m-V9mntUPZNU3IP0JMQaKBcpNgGfMPal72INZ-nZsV3kxwWmQR7qQ7YATvoFfENLw6vuo4rNCjM36opXdBDeGzbxH-q86bZpA',
  },
  {
    id: 2,
    name: 'Blippi',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAkKQ_iYk7Pblor4K10ZrejHUaTmoJnbg6Pa_8p0N8Kh1_HY5N6jEQylBbiKVesLm5D9ZqpWOk1TGxkHOv4jf8BhTWyzLUhPiiPMJshxPRcje4ql5BAcBA_6aLmBjZY2Ttrt8ALso9NkjDxG4qOQXNLviIcsop8vKUfhsgDxXnnQcl2i9s8bkPYe2ViG02TUee_njZ2YpkOchFJOzTBZAba1wAOAg0_G-8Brw1oDxW6s3jqU-4LRZOS-SCOX14oRefpl7S09zyQvAc',
  },
];

export const defaultParentControlSettings: ParentControlSettings = {
  screenLimitEnabled: true,
  screenMinutes: 90,
  bedtimeEnabled: true,
  bedtimeStart: '20:00',
  bedtimeEnd: '07:00',
  deviceLocked: false,
  blockedChannels: initialBlockedChannels,
  blockedVideoIds: [],
  parentPin: '1234',
  requireParentPin: true,
};

const chartData = [
  { day: 'Mon', videos: 10, games: 40, reading: 30 },
  { day: 'Tue', videos: 20, games: 50, reading: 20 },
  { day: 'Wed', videos: 15, games: 30, reading: 40 },
  { day: 'Thu', videos: 10, games: 60, reading: 10 },
  { day: 'Fri', videos: 25, games: 40, reading: 30 },
  { day: 'Sat', videos: 5, games: 20, reading: 50 },
  { day: 'Sun', videos: 15, games: 35, reading: 25 },
];

export default function ParentDashboard({
  onClose,
  settings,
  profileId,
  profileName,
  customProfiles,
  onDeleteCustomProfile,
  onUpdateCustomProfile,
  onToggleProfileProtection,
  onSettingsChange,
}: ParentDashboardProps) {
  const [activeSection, setActiveSection] =
    useState<
      'screen-time' |
      'content-filters' |
      'activity-history' |
      'profiles' |
      'settings'
    >('screen-time');

  const [newBlockedChannel, setNewBlockedChannel] =
    useState('');

  const [newParentPin, setNewParentPin] =
    useState(settings.parentPin || '1234');

  const [settingsMessage, setSettingsMessage] =
    useState('');

  const [editingProfileId, setEditingProfileId] =
    useState<number | null>(null);

  const [editProfileName, setEditProfileName] =
    useState('');

  const [editProfileAge, setEditProfileAge] =
    useState(5);

  const [editProfileEmoji, setEditProfileEmoji] =
    useState('🦁');

  const [editProfileColor, setEditProfileColor] =
    useState('#ffb703');

  const profileAvatarOptions = [
    '🦁',
    '🐼',
    '🐰',
    '🐻',
    '🦊',
  ];

  const startEditingProfile = (
    child: ManagedCustomProfile,
  ) => {
    setEditingProfileId(child.id);
    setEditProfileName(child.name);
    setEditProfileAge(child.age ?? 5);
    setEditProfileEmoji(child.emoji);
    setEditProfileColor(child.color);
  };

  const cancelEditingProfile = () => {
    setEditingProfileId(null);
  };

  const saveEditedProfile = (
    child: ManagedCustomProfile,
  ) => {
    const cleanName = editProfileName.trim();

    if (cleanName.length < 2) {
      window.alert(
        'Profile name must contain at least 2 characters.',
      );
      return;
    }

    onUpdateCustomProfile({
      ...child,
      name: cleanName,
      age: editProfileAge,
      emoji: editProfileEmoji,
      color: editProfileColor,
    });

    setEditingProfileId(null);
  };

  const loadWatchHistory = (): WatchHistoryItem[] => {
    try {
      const saved = localStorage.getItem(
        'sasa-watch-history',
      );

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (item): item is WatchHistoryItem =>
          item &&
          Number(item.profileId) === Number(profileId),
      );
    } catch {
      return [];
    }
  };

  const [watchHistory, setWatchHistory] =
    useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setWatchHistory(loadWatchHistory());
  }, [profileId, activeSection]);
  const {
    screenLimitEnabled,
    screenMinutes,
    bedtimeEnabled,
    bedtimeStart,
    bedtimeEnd,
    deviceLocked,
    blockedChannels,
    blockedVideoIds = [],
    parentPin = '1234',
    requireParentPin = true,
  } = settings;

  const updateSettings = (
    changes: Partial<ParentControlSettings>,
  ) => {
    onSettingsChange({
      ...settings,
      ...changes,
    });
  };

  const formattedTime = formatMinutes(screenMinutes);

  const unblockChannel = (channelId: number) => {
    updateSettings({
      blockedChannels: blockedChannels.filter(
        (channel) => channel.id !== channelId,
      ),
    });
  };

  const blockChannel = () => {
    const name = newBlockedChannel.trim();

    if (!name) {
      return;
    }

    const alreadyBlocked = blockedChannels.some(
      (channel) =>
        channel.name.toLowerCase() === name.toLowerCase(),
    );

    if (alreadyBlocked) {
      setNewBlockedChannel('');
      return;
    }

    const initial = name.charAt(0).toUpperCase();

    const avatar = `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" rx="28" fill="#dbeafe"/>
        <text x="60" y="76" text-anchor="middle"
          font-family="Arial" font-size="58" font-weight="700"
          fill="#2563eb">${initial}</text>
      </svg>
    `)}`;

    updateSettings({
      blockedChannels: [
        ...blockedChannels,
        {
          id: Date.now(),
          name,
          image: avatar,
        },
      ],
    });

    setNewBlockedChannel('');
  };

  const toggleVideoBlock = (videoId: number) => {
    const blocked = blockedVideoIds.includes(videoId);

    updateSettings({
      blockedVideoIds: blocked
        ? blockedVideoIds.filter((id) => id !== videoId)
        : [...blockedVideoIds, videoId],
    });
  };

  const saveParentPin = () => {
    const cleanPin = newParentPin.trim();

    if (!/^\d{4,6}$/.test(cleanPin)) {
      setSettingsMessage(
        'PIN must contain 4 to 6 numbers.',
      );
      return;
    }

    updateSettings({
      parentPin: cleanPin,
    });

    setSettingsMessage('Parent PIN saved.');
  };

  const resetScreenTimer = () => {
    if (profileId !== null) {
      const expiryKey =
        `sasa-screen-expiry-${profileId}`;

      if (screenLimitEnabled) {
        localStorage.setItem(
          expiryKey,
          String(
            Date.now() +
              screenMinutes * 60 * 1000,
          ),
        );
      } else {
        localStorage.removeItem(expiryKey);
      }
    }

    setSettingsMessage('Screen-time timer restarted.');
  };

  const resetAllParentSettings = () => {
    const resetSettings = {
      ...defaultParentControlSettings,
      deviceLocked: false,
    };

    onSettingsChange(resetSettings);
    setNewParentPin(resetSettings.parentPin);

    if (profileId !== null) {
      localStorage.removeItem(
        `sasa-screen-expiry-${profileId}`,
      );
    }

    setSettingsMessage(
      'Parental settings restored to defaults.',
    );
  };

  const clearWatchHistory = () => {
    try {
      const saved = localStorage.getItem(
        'sasa-watch-history',
      );

      const parsed = saved ? JSON.parse(saved) : [];
      const allHistory = Array.isArray(parsed)
        ? parsed
        : [];

      const remaining = allHistory.filter(
        (item) =>
          Number(item.profileId) !== Number(profileId),
      );

      localStorage.setItem(
        'sasa-watch-history',
        JSON.stringify(remaining),
      );

      setWatchHistory([]);
    } catch {
      setWatchHistory([]);
    }
  };

  return (
    <div className="parent-dashboard">
      <MobileHeader onClose={onClose} />

      <aside className="parent-sidebar">
        <div className="parent-brand">WonderWatch</div>

        <nav className="parent-sidebar-nav">
          <button
            type="button"
            className={
              activeSection === 'screen-time'
                ? 'parent-nav-item active'
                : 'parent-nav-item'
            }
            onClick={() => setActiveSection('screen-time')}
          >
            <Clock3 size={26} />
            Screen Time
          </button>

          <button
            type="button"
            className={
              activeSection === 'content-filters'
                ? 'parent-nav-item active'
                : 'parent-nav-item'
            }
            onClick={() =>
              setActiveSection('content-filters')
            }
          >
            <Shield size={26} />
            Content Filters
          </button>

          <button
            type="button"
            className={
              activeSection === 'profiles'
                ? 'parent-nav-item active'
                : 'parent-nav-item'
            }
            onClick={() =>
              setActiveSection('profiles')
            }
          >
            <span className="parent-nav-emoji">👨‍👩‍👧</span>
            Profiles
          </button>

          <button
            type="button"
            className={
              activeSection === 'activity-history'
                ? 'parent-nav-item active'
                : 'parent-nav-item'
            }
            onClick={() =>
              setActiveSection('activity-history')
            }
          >
            <BarChart3 size={26} />
            Activity & History
          </button>
        </nav>

        <div className="parent-sidebar-footer">
          <button
            type="button"
            className={
              activeSection === 'settings'
                ? 'parent-settings-button active'
                : 'parent-settings-button'
            }
            onClick={() =>
              setActiveSection('settings')
            }
          >
            <Settings size={21} />
            Settings
          </button>

          <button className="parent-close-button" onClick={onClose}>
            <X size={21} />
            Exit dashboard
          </button>
        </div>
      </aside>

      <main className="parent-dashboard-main">
        <header className="parent-desktop-header">
          <h1>
            {activeSection === 'screen-time'
              ? 'Screen Time Dashboard'
              : activeSection === 'content-filters'
                ? 'Content Filters'
                : activeSection === 'activity-history'
                  ? 'Activity & History'
                  : activeSection === 'profiles'
                    ? 'Profile Management'
                    : 'Parent Settings'}
          </h1>

          <div className="parent-account-area">
            <button className="parent-round-button">
              <Bell size={21} />
            </button>

            <div className="parent-account">
              <span>P</span>
              <strong>Parent Account</strong>
            </div>

            <button className="parent-round-button" onClick={onClose}>
              <X size={21} />
            </button>
          </div>
        </header>

        <div className="parent-dashboard-content">
          <h2 className="parent-mobile-title">
            {activeSection === 'screen-time'
              ? 'Screen Time'
              : activeSection === 'content-filters'
                ? 'Content Filters'
                : activeSection === 'activity-history'
                  ? 'Activity & History'
                  : activeSection === 'profiles'
                    ? 'Profiles'
                    : 'Parent Settings'}
          </h2>

          {activeSection === 'screen-time' && (
            <>
          <MobileScreenTimeCard
            enabled={screenLimitEnabled}
            minutes={screenMinutes}
            formattedTime={formattedTime}
            onToggle={() =>
              updateSettings({
                screenLimitEnabled:
                  !screenLimitEnabled,
              })
            }
            onMinutesChange={(minutes) =>
              updateSettings({
                screenMinutes: minutes,
              })
            }
          />

          <section className="screen-time-quick-control">
            <div className="screen-time-quick-heading">
              <div>
                <h3>Daily Time Limit</h3>
                <p>
                  Select how long the child can use the app.
                </p>
              </div>

              <strong>
                {screenLimitEnabled
                  ? formattedTime
                  : 'Disabled'}
              </strong>
            </div>

            <div className="screen-time-preset-grid">
              {[1, 5, 15, 30, 60, 90].map(
                (minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={
                      screenLimitEnabled &&
                      screenMinutes === minutes
                        ? 'selected'
                        : ''
                    }
                    onClick={() =>
                      updateSettings({
                        screenLimitEnabled: true,
                        screenMinutes: minutes,
                      })
                    }
                  >
                    {minutes < 60
                      ? `${minutes} min`
                      : minutes === 60
                        ? '1 hour'
                        : '1h 30m'}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              className={
                screenLimitEnabled
                  ? 'screen-time-disable-button'
                  : 'screen-time-enable-button'
              }
              onClick={() =>
                updateSettings({
                  screenLimitEnabled:
                    !screenLimitEnabled,
                })
              }
            >
              {screenLimitEnabled
                ? 'Disable Time Limit'
                : 'Enable Time Limit'}
            </button>

            <p className="screen-time-help">
              The new timer starts when you exit the
              parent dashboard.
            </p>
          </section>

          <MobileHistory />

          <MobileBlockedChannels
            channels={blockedChannels}
            onUnblock={unblockChannel}
          />

          <section className="parent-desktop-layout">
            <div className="parent-chart-card">
              <div className="parent-card-heading">
                <div>
                  <h2>Weekly Overview</h2>
                  <p>Total: 14h 25m</p>
                </div>

                <button className="parent-round-button">
                  <MoreHorizontal size={22} />
                </button>
              </div>

              <div className="parent-chart">
                {chartData.map((item) => (
                  <div className="parent-chart-column" key={item.day}>
                    <div className="parent-bars">
                      <div
                        className="bar videos"
                        style={{ height: `${item.videos}%` }}
                      />
                      <div
                        className="bar reading"
                        style={{ height: `${item.reading}%` }}
                      />
                      <div
                        className="bar games"
                        style={{ height: `${item.games}%` }}
                      />
                    </div>

                    <span>{item.day}</span>
                  </div>
                ))}
              </div>

              <div className="chart-legend">
                <Legend colorClass="videos" label="Videos" />
                <Legend colorClass="games" label="Games" />
                <Legend colorClass="reading" label="Reading" />
              </div>
            </div>

            <div className="parent-stat-column">
              <article className="parent-stat-card daily-average">
                <div className="stat-icon">
                  <Timer size={32} />
                </div>
                <h3>Daily Average</h3>
                <strong>2h 03m</strong>
              </article>

              <article className="parent-stat-card bedtime-card">
                <div className="bedtime-heading">
                  <div className="bedtime-icon">
                    <Bed size={24} />
                  </div>

                  <div>
                    <h3>Bedtime Mode</h3>
                    <p>
                      {bedtimeStart} – {bedtimeEnd}
                    </p>

                    <small className="bedtime-saved-message">
                      Schedule saved automatically
                    </small>
                  </div>
                </div>

                <div className="bedtime-time-controls">
                  <label>
                    <span>Starts</span>
                    <input
                      type="time"
                      value={bedtimeStart}
                      onChange={(event) =>
                        updateSettings({
                          bedtimeStart: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Ends</span>
                    <input
                      type="time"
                      value={bedtimeEnd}
                      onChange={(event) =>
                        updateSettings({
                          bedtimeEnd: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <div className="bedtime-status">
                  <span>Status</span>

                  <button
                    type="button"
                    className={
                      bedtimeEnabled
                        ? 'bedtime-toggle enabled'
                        : 'bedtime-toggle'
                    }
                    onClick={() =>
                      updateSettings({
                        bedtimeEnabled: !bedtimeEnabled,
                      })
                    }
                  >
                    <strong>
                      {bedtimeEnabled ? 'ON' : 'OFF'}
                    </strong>

                    <span>
                      {bedtimeEnabled ? (
                        <Bed size={17} />
                      ) : (
                        <Clock3 size={17} />
                      )}
                    </span>
                  </button>
                </div>
              </article>

              <article className="parent-lock-card">
                <h3>Need a break?</h3>
                <p>
                  Instantly lock the device for dinner time or chores.
                </p>

                <button
                  type="button"
                  onClick={() => updateSettings({ deviceLocked: !deviceLocked })}
                >
                  <Lock size={20} />
                  {deviceLocked
                    ? 'Unlock Device'
                    : 'Lock Device Now'}
                </button>
              </article>
            </div>
          </section>
            </>
          )}

          {activeSection === 'content-filters' && (
            <section className="parent-content-filter-page">
              <article className="content-filter-card">
                <div className="content-filter-card-heading">
                  <div>
                    <h2>Blocked Channels</h2>
                    <p>
                      Restricted channels will not appear
                      in the child&apos;s view.
                    </p>
                  </div>

                  <strong>
                    {blockedChannels.length} blocked
                  </strong>
                </div>

                <div className="channel-block-form">
                  <input
                    type="text"
                    value={newBlockedChannel}
                    placeholder="Enter channel name to block"
                    onChange={(event) =>
                      setNewBlockedChannel(
                        event.target.value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        blockChannel();
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={blockChannel}
                  >
                    + Block
                  </button>
                </div>

                <div className="content-blocked-list">
                  {blockedChannels.map((channel) => (
                    <div
                      className="content-blocked-row"
                      key={channel.id}
                    >
                      <div className="content-blocked-info">
                        <img
                          src={channel.image}
                          alt={channel.name}
                        />

                        <div>
                          <h3>{channel.name}</h3>
                          <span>
                            Restricted by Parent
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          unblockChannel(channel.id)
                        }
                      >
                        Unblock
                      </button>
                    </div>
                  ))}

                  {blockedChannels.length === 0 && (
                    <div className="content-filter-empty">
                      No channels are currently blocked.
                    </div>
                  )}
                </div>
              </article>

              <article className="content-filter-card">
                <div className="content-filter-card-heading">
                  <div>
                    <h2>Video Catalog Management</h2>
                    <p>
                      Toggle block or allow status for
                      individual videos.
                    </p>
                  </div>

                  <strong>
                    {blockedVideoIds.length} blocked
                  </strong>
                </div>

                <div className="video-filter-grid">
                  {kidsVideos.map((video) => {
                    const blocked =
                      blockedVideoIds.includes(video.id);

                    return (
                      <div
                        className={
                          blocked
                            ? 'video-filter-item blocked'
                            : 'video-filter-item'
                        }
                        key={video.id}
                      >
                        <img
                          src={video.image}
                          alt={video.title}
                        />

                        <div className="video-filter-details">
                          <h3>{video.title}</h3>
                          <p>{video.category}</p>
                        </div>

                        <button
                          type="button"
                          className={
                            blocked
                              ? 'allow-video-button'
                              : 'block-video-button'
                          }
                          onClick={() =>
                            toggleVideoBlock(video.id)
                          }
                        >
                          {blocked ? 'Allow' : 'Block'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </article>
            </section>
          )}

          {activeSection === 'activity-history' && (
            <section className="activity-history-page">
              <div className="activity-summary-grid">
                <article className="activity-summary-card">
                  <span>▶️</span>
                  <div>
                    <strong>{watchHistory.length}</strong>
                    <p>Total video opens</p>
                  </div>
                </article>

                <article className="activity-summary-card">
                  <span>🎬</span>
                  <div>
                    <strong>
                      {
                        new Set(
                          watchHistory.map(
                            (item) => item.videoId,
                          ),
                        ).size
                      }
                    </strong>
                    <p>Unique videos</p>
                  </div>
                </article>

                <article className="activity-summary-card">
                  <span>👤</span>
                  <div>
                    <strong>{profileName}</strong>
                    <p>Selected profile</p>
                  </div>
                </article>
              </div>

              <article className="activity-history-card">
                <div className="activity-history-heading">
                  <div>
                    <h2>Watch History</h2>
                    <p>
                      Videos opened by {profileName}.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={watchHistory.length === 0}
                    onClick={clearWatchHistory}
                  >
                    Clear History
                  </button>
                </div>

                {watchHistory.length === 0 ? (
                  <div className="activity-history-empty">
                    <span>📺</span>
                    <h3>No watch history yet</h3>
                    <p>
                      Videos will appear here after the
                      child opens them.
                    </p>
                  </div>
                ) : (
                  <div className="activity-history-list">
                    {watchHistory.map((item) => (
                      <article
                        className="activity-history-row"
                        key={item.historyId}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                        />

                        <div className="activity-history-details">
                          <h3>{item.title}</h3>

                          <div>
                            <span>{item.category}</span>
                            <span>{item.duration}</span>
                          </div>
                        </div>

                        <time>
                          {new Date(
                            item.watchedAt,
                          ).toLocaleString()}
                        </time>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}

          {activeSection === 'profiles' && (
            <section className="profile-management-page">
              <div className="profile-management-heading">
                <div>
                  <h2>Child Profiles</h2>
                  <p>
                    View built-in profiles and manage
                    profiles created by the parent.
                  </p>
                </div>

                <strong>
                  {3 + customProfiles.length} profiles
                </strong>
              </div>

              <div className="profile-management-grid">
                {[
                  {
                    id: 1,
                    name: 'Leo',
                    emoji: '🦁',
                    color: '#ffa62b',
                  },
                  {
                    id: 2,
                    name: 'Poppy',
                    emoji: '🐼',
                    color: '#95d5b2',
                  },
                  {
                    id: 3,
                    name: 'Ruby',
                    emoji: '🐰',
                    color: '#ff8fa3',
                  },
                ].map((child) => (
                  <article
                    key={child.id}
                    className="profile-management-card"
                  >
                    <div
                      className="profile-management-avatar"
                      style={{
                        backgroundColor: child.color,
                      }}
                    >
                      {child.emoji}
                    </div>

                    <div className="profile-management-info">
                      <h3>{child.name}</h3>
                      <p>Built-in profile</p>
                    </div>

                    <span className="profile-protected-badge">
                      Protected
                    </span>
                  </article>
                ))}

                {customProfiles.map((child) => {
                  const isEditing =
                    editingProfileId === child.id;

                  return (
                    <article
                      key={child.id}
                      className={
                        child.isProtected
                          ? 'profile-management-card protected'
                          : 'profile-management-card'
                      }
                    >
                      {isEditing ? (
                        <div className="profile-edit-form">
                          <div className="profile-edit-preview">
                            <div
                              className="profile-management-avatar"
                              style={{
                                backgroundColor:
                                  editProfileColor,
                              }}
                            >
                              {editProfileEmoji}
                            </div>
                          </div>

                          <label>
                            <span>Name</span>
                            <input
                              type="text"
                              maxLength={20}
                              value={editProfileName}
                              onChange={(event) =>
                                setEditProfileName(
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          <label>
                            <span>Age</span>
                            <input
                              type="number"
                              min={2}
                              max={17}
                              value={editProfileAge}
                              onChange={(event) =>
                                setEditProfileAge(
                                  Math.min(
                                    17,
                                    Math.max(
                                      2,
                                      Number(
                                        event.target.value,
                                      ),
                                    ),
                                  ),
                                )
                              }
                            />
                          </label>

                          <div className="profile-edit-avatars">
                            {profileAvatarOptions.map(
                              (emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  className={
                                    editProfileEmoji ===
                                    emoji
                                      ? 'selected'
                                      : ''
                                  }
                                  onClick={() =>
                                    setEditProfileEmoji(
                                      emoji,
                                    )
                                  }
                                >
                                  {emoji}
                                </button>
                              ),
                            )}
                          </div>

                          <label>
                            <span>Profile color</span>
                            <input
                              type="color"
                              value={editProfileColor}
                              onChange={(event) =>
                                setEditProfileColor(
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          <div className="profile-edit-actions">
                            <button
                              type="button"
                              className="profile-save-button"
                              onClick={() =>
                                saveEditedProfile(child)
                              }
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              className="profile-cancel-button"
                              onClick={cancelEditingProfile}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className="profile-management-avatar"
                            style={{
                              backgroundColor:
                                child.color,
                            }}
                          >
                            {child.emoji}
                          </div>

                          <div className="profile-management-info">
                            <h3>
                              {child.name}
                              {child.isProtected && (
                                <span
                                  className="profile-lock-icon"
                                  title="Protected profile"
                                >
                                  🔒
                                </span>
                              )}
                            </h3>

                            <p>
                              {child.age
                                ? `Age ${child.age}`
                                : 'Custom profile'}
                            </p>
                          </div>

                          <div className="profile-management-actions">
                            <button
                              type="button"
                              className="profile-edit-button"
                              onClick={() =>
                                startEditingProfile(
                                  child,
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="profile-protect-button"
                              onClick={() =>
                                onToggleProfileProtection(
                                  child.id,
                                )
                              }
                            >
                              {child.isProtected
                                ? 'Unprotect'
                                : 'Protect'}
                            </button>

                            <button
                              type="button"
                              className="profile-delete-button"
                              disabled={
                                child.isProtected
                              }
                              onClick={() => {
                                if (
                                  child.isProtected
                                ) {
                                  return;
                                }

                                const confirmed =
                                  window.confirm(
                                    `Delete ${child.name}'s profile?`,
                                  );

                                if (confirmed) {
                                  onDeleteCustomProfile(
                                    child.id,
                                  );
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  );
                })}
              </div>

              {customProfiles.length === 0 && (
                <div className="profile-management-empty">
                  <span>➕</span>
                  <h3>No custom profiles yet</h3>
                  <p>
                    Custom profiles created from the
                    profile-selection page will appear here.
                  </p>
                </div>
              )}
            </section>
          )}

          {activeSection === 'settings' && (
            <section className="parent-settings-page">
              <article className="parent-settings-card">
                <div className="parent-settings-heading">
                  <div>
                    <h2>Parent Access</h2>
                    <p>
                      Protect parental controls with a
                      private numeric PIN.
                    </p>
                  </div>
                </div>

                <label className="parent-settings-toggle-row">
                  <div>
                    <strong>Require Parent PIN</strong>
                    <span>
                      Ask for the PIN before opening the
                      parent dashboard.
                    </span>
                  </div>

                  <button
                    type="button"
                    className={
                      requireParentPin
                        ? 'parent-switch enabled'
                        : 'parent-switch'
                    }
                    onClick={() =>
                      updateSettings({
                        requireParentPin:
                          !requireParentPin,
                      })
                    }
                  >
                    <span />
                  </button>
                </label>

                <div className="parent-pin-form">
                  <label>
                    <span>New Parent PIN</span>

                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={newParentPin}
                      onChange={(event) => {
                        setNewParentPin(
                          event.target.value.replace(
                            /\D/g,
                            '',
                          ),
                        );

                        setSettingsMessage('');
                      }}
                      placeholder="4 to 6 numbers"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={saveParentPin}
                  >
                    Save PIN
                  </button>
                </div>
              </article>

              <article className="parent-settings-card">
                <div className="parent-settings-heading">
                  <div>
                    <h2>Screen-Time Tools</h2>
                    <p>
                      Restart the current child&apos;s
                      screen-time allowance.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="parent-reset-timer-button"
                  onClick={resetScreenTimer}
                >
                  Restart Screen-Time Timer
                </button>
              </article>

              <article className="parent-settings-card danger">
                <div className="parent-settings-heading">
                  <div>
                    <h2>Reset Parental Settings</h2>
                    <p>
                      Restore screen time, bedtime,
                      filters and PIN to their defaults.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="parent-reset-all-button"
                  onClick={resetAllParentSettings}
                >
                  Reset All Parental Settings
                </button>
              </article>

              {settingsMessage && (
                <div className="parent-settings-message">
                  {settingsMessage}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <MobileBottomNavigation />
    </div>
  );
}

function MobileHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="parent-mobile-header">
      <button>
        <Menu size={25} />
      </button>

      <h1>WonderWatch</h1>

      <button onClick={onClose}>
        <X size={25} />
      </button>
    </header>
  );
}

function MobileScreenTimeCard({
  enabled,
  minutes,
  formattedTime,
  onToggle,
  onMinutesChange,
}: {
  enabled: boolean;
  minutes: number;
  formattedTime: string;
  onToggle: () => void;
  onMinutesChange: (minutes: number) => void;
}) {
  return (
    <section className="mobile-screen-time-card">
      <div className="parent-card-heading">
        <div>
          <h2>Screen Time Limit</h2>
          <p>Daily Limit</p>
        </div>

        <button
          type="button"
          className={
            enabled
              ? 'parent-switch enabled'
              : 'parent-switch'
          }
          onClick={onToggle}
          aria-label="Toggle screen time limit"
        >
          <span />
        </button>
      </div>

      <strong className="screen-time-value">
        {formattedTime}
      </strong>

      <input
        className="parent-range"
        type="range"
        min="0"
        max="180"
        step="15"
        value={minutes}
        disabled={!enabled}
        onChange={(event) =>
          onMinutesChange(Number(event.target.value))
        }
      />

      <p className="screen-time-help">
        Set a daily limit for viewing.
      </p>
    </section>
  );
}

function MobileHistory() {
  return (
    <section className="mobile-dashboard-section">
      <div className="mobile-section-heading">
        <h2>Watch History</h2>
        <button>See All</button>
      </div>

      <div className="mobile-history-list">
        {historyItems.map((item) => (
          <article className="history-card" key={item.id}>
            <img src={item.image} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.watched}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileBlockedChannels({
  channels,
  onUnblock,
}: {
  channels: BlockedChannel[];
  onUnblock: (id: number) => void;
}) {
  return (
    <section className="mobile-dashboard-section blocked-section">
      <div className="mobile-section-heading">
        <h2>Blocked Channels</h2>
        <button>Add</button>
      </div>

      <div className="blocked-channel-list">
        {channels.length === 0 && (
          <p className="empty-blocked-message">
            No channels are currently blocked.
          </p>
        )}

        {channels.map((channel) => (
          <div className="blocked-channel" key={channel.id}>
            <div>
              <img src={channel.image} alt={channel.name} />
              <strong>{channel.name}</strong>
            </div>

            <button onClick={() => onUnblock(channel.id)}>
              Unblock
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function MobileBottomNavigation() {
  return (
    <nav className="parent-mobile-bottom-nav">
      <button>
        <Home size={26} />
        <span>Home</span>
      </button>

      <button>
        <Search size={26} />
        <span>Search</span>
      </button>

      <button>
        <Library size={26} />
        <span>Library</span>
      </button>

      <button className="active">
        <UserCircle size={26} />
        <span>Profile</span>
      </button>
    </nav>
  );
}

function Legend({
  colorClass,
  label,
}: {
  colorClass: string;
  label: string;
}) {
  return (
    <div>
      <span className={`legend-color ${colorClass}`} />
      <strong>{label}</strong>
    </div>
  );
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}
