import { Lock, ShieldCheck, Users } from 'lucide-react';

type DeviceLockedProps = {
  onParentUnlock: () => void;
  onChangeProfile: () => void;
};

export default function DeviceLocked({
  onParentUnlock,
  onChangeProfile,
}: DeviceLockedProps) {
  return (
    <main className="device-locked-page">
      <section className="device-locked-card">
        <div className="device-lock-icon">
          <Lock size={48} />
        </div>

        <h1>Time for a Break!</h1>

        <p>
          A parent has temporarily paused videos on this device.
        </p>

        <div className="device-locked-actions">
          <button
            type="button"
            className="parent-unlock-button"
            onClick={onParentUnlock}
          >
            <ShieldCheck size={21} />
            Parent Unlock
          </button>

          <button
            type="button"
            className="change-profile-button"
            onClick={onChangeProfile}
          >
            <Users size={21} />
            Change Profile
          </button>
        </div>
      </section>
    </main>
  );
}
