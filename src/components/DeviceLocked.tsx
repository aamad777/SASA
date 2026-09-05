import { Clock, Lock, Moon, ShieldCheck, Users } from "lucide-react";
import type { DeviceLockReason } from "./ParentDashboard";

/** Bedtime is derived from the clock, so it is not a stored DeviceLockReason. */
export type LockScreenReason = DeviceLockReason | "bedtime";

type DeviceLockedProps = {
  reason: LockScreenReason;
  /** Shown on the bedtime screen so the child knows when videos come back. */
  bedtimeEnd?: string;
  /** Shown on the screen-time screen so the child knows what ran out. */
  screenMinutes?: number;
  /** The child currently signed in, so the screen speaks to them by name. */
  childName?: string;
  onParentUnlock: () => void;
  onChangeProfile: () => void;
};

/** "20:00" -> "8:00 PM". Falls back to the raw value if it isn't HH:MM. */
function friendlyTime(value?: string): string | null {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const suffix = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function content(reason: LockScreenReason, bedtimeEnd?: string, screenMinutes?: number) {
  if (reason === "bedtime") {
    const back = friendlyTime(bedtimeEnd);
    return {
      icon: <Moon size={48} />,
      title: "It's bedtime",
      body: back
        ? `Videos are asleep until ${back}. Time to rest — they'll be right here in the morning.`
        : "Videos are asleep for the night. Time to rest — they'll be right here in the morning.",
    };
  }

  if (reason === "screenTime") {
    return {
      icon: <Clock size={48} />,
      title: "Screen time is finished",
      body:
        typeof screenMinutes === "number"
          ? `You've watched your ${screenMinutes} minutes for today. Ask a grown-up if you'd like more.`
          : "You've watched all your minutes for today. Ask a grown-up if you'd like more.",
    };
  }

  return {
    icon: <Lock size={48} />,
    title: "A grown-up paused videos",
    body: "A parent turned videos off on this device. They can turn them back on whenever they're ready.",
  };
}

export default function DeviceLocked({
  reason,
  bedtimeEnd,
  screenMinutes,
  childName,
  onParentUnlock,
  onChangeProfile,
}: DeviceLockedProps) {
  const { icon, title, body } = content(reason, bedtimeEnd, screenMinutes);

  return (
    <main className="device-locked-page">
      <section className="device-locked-card">
        <div className="device-lock-icon">{icon}</div>

        <h1>{childName ? `${title}, ${childName}` : title}</h1>

        <p>{body}</p>

        <div className="device-locked-actions">
          <button type="button" className="parent-unlock-button" onClick={onParentUnlock}>
            <ShieldCheck size={21} />
            Parent Unlock
          </button>

          <button type="button" className="change-profile-button" onClick={onChangeProfile}>
            <Users size={21} />
            Change Profile
          </button>
        </div>
      </section>
    </main>
  );
}
