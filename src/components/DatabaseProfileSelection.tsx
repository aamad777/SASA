import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Plus, X, Settings } from "lucide-react";
import BrandMark from "./layout/BrandMark";
import ProfileAvatar from "./layout/ProfileAvatar";

// SARA_PIN_RESET_V5 — aliased on import: this file also declares a local
// `setChildPin` state setter (useState below) for the *verify* PIN input.
// The previous unaliased import let that local declaration silently shadow
// this API function for the whole component, so "Update PIN" was actually
// calling the React state setter (which just no-ops on 3 arguments) instead
// of ever hitting the backend — it looked like it saved but nothing changed.
import {
  createChild,
  loginChild,
  setChildPin as updateChildPin,
  type DatabaseChild,
} from "../lib/api";

type Props = {
  token: string;
  children: DatabaseChild[];
  loading: boolean;
  error: string;
  parentName: string;
  onSelectChild: (child: DatabaseChild) => void;
  onChildCreated: (child: DatabaseChild) => void;
  onChildPinChanged: (childId: string) => void;
  onRetry: () => void;
  onOpenParentControls: () => void;
  onLogout: () => void;
};

const emojis = ["🦁", "🐼", "🐰", "🐻", "🦊", "🐸"];
const colors = ["#ffa62b", "#95d5b2", "#ff8fa3", "#8ecae6", "#c89f7a", "#b8e986"];

// child.id is the backend's real (string) id — hash it the same way
// ParentDashboard already hashes string media ids for a stable numeric key,
// so the emoji/color pick stays deterministic per child regardless of
// whether an id happens to look numeric.
function hashChildId(childId: string | number): number {
  if (typeof childId === "number") {
    return Math.abs(childId);
  }

  return Array.from(childId).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
}

export function getDatabaseProfileEmoji(childId: string | number): string {
  return emojis[hashChildId(childId) % emojis.length];
}

export function getDatabaseProfileColor(childId: string | number): string {
  return colors[hashChildId(childId) % colors.length];
}

function getSavedChildImage(child: DatabaseChild): string | undefined {
  if (typeof window !== "undefined") {
    const selectedCartoon = localStorage.getItem(`sasa-child-image-${child.id}`);

    if (selectedCartoon) {
      return selectedCartoon;
    }
  }

  return child.avatar_url || undefined;
}

export default function DatabaseProfileSelection({
  token,
  children,
  loading,
  error,
  parentName,
  onSelectChild,
  onChildCreated,
  onChildPinChanged,
  onRetry,
  onOpenParentControls,
  onLogout,
}: Props) {
  const normalizedParentName = parentName?.trim();

  const displayParentName =
    normalizedParentName && !["undefined", "null"].includes(normalizedParentName.toLowerCase())
      ? normalizedParentName
      : "Parent";

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [loginName, setLoginName] = useState("");
  const [age, setAge] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [pendingChild, setPendingChild] = useState<DatabaseChild | null>(null);

  const [childPin, setChildPin] = useState("");

  const [childPinError, setChildPinError] = useState("");

  const [checkingChildPin, setCheckingChildPin] = useState(false);

  const [showChildPin, setShowChildPin] = useState(false);

  const [showManagePin, setShowManagePin] = useState(false);

  const [managedChildId, setManagedChildId] = useState<string | null>(null);

  const [newChildPin, setNewChildPin] = useState("");

  const [confirmChildPin, setConfirmChildPin] = useState("");

  const [showNewChildPin, setShowNewChildPin] = useState(false);

  const [managePinError, setManagePinError] = useState("");

  const [managePinSuccess, setManagePinSuccess] = useState("");

  const [savingManagedPin, setSavingManagedPin] = useState(false);

  const openChildProfile = (child: DatabaseChild) => {
    if (!child.has_pin) {
      localStorage.removeItem("sasa-child-token");

      onSelectChild(child);
      return;
    }

    if (!child.login_name) {
      setPendingChild(child);
      setChildPinError("This child does not have a login name.");
      return;
    }

    setPendingChild(child);
    setChildPin("");
    setChildPinError("");
    setShowChildPin(false);
  };

  const verifyChildPin = async () => {
    if (!pendingChild?.login_name) {
      return;
    }

    if (childPin.length < 4) {
      setChildPinError("Enter the child PIN.");
      return;
    }

    setCheckingChildPin(true);
    setChildPinError("");

    try {
      await loginChild(pendingChild.login_name, childPin);

      localStorage.removeItem("sasa-child-token");

      const verifiedChild = pendingChild;

      setPendingChild(null);
      setChildPin("");
      setShowChildPin(false);

      onSelectChild(verifiedChild);
    } catch (error) {
      setChildPinError(error instanceof Error ? error.message : "Wrong child PIN.");
    } finally {
      setCheckingChildPin(false);
    }
  };

  const closeManagePin = () => {
    if (savingManagedPin) return;

    setShowManagePin(false);
    setManagedChildId(null);
    setNewChildPin("");
    setConfirmChildPin("");
    setManagePinError("");
    setManagePinSuccess("");
    setShowNewChildPin(false);
  };

  const saveManagedPin = async () => {
    if (!managedChildId) {
      setManagePinError("Select a child.");
      return;
    }

    if (newChildPin.length < 4 || !/^\d+$/.test(newChildPin)) {
      setManagePinError("PIN must contain at least 4 digits.");
      return;
    }

    if (newChildPin !== confirmChildPin) {
      setManagePinError("The two PIN values do not match.");
      return;
    }

    setSavingManagedPin(true);
    setManagePinError("");
    setManagePinSuccess("");

    try {
      await updateChildPin(token, managedChildId, newChildPin);

      onChildPinChanged(managedChildId);

      setManagePinSuccess("Child PIN updated successfully.");

      setNewChildPin("");
      setConfirmChildPin("");

      window.setTimeout(() => {
        closeManagePin();
      }, 900);
    } catch (error) {
      setManagePinError(error instanceof Error ? error.message : "Unable to update child PIN.");
    } finally {
      setSavingManagedPin(false);
    }
  };

  const saveChild = async () => {
    const cleanName = name.trim();
    const cleanLogin = loginName.trim().toLowerCase();

    if (!cleanName) {
      setFormError("Enter the child name.");
      return;
    }

    if (!cleanLogin) {
      setFormError("Enter the child login name.");
      return;
    }

    if (pin && (!/^\d+$/.test(pin) || pin.length < 4)) {
      setFormError("PIN must contain at least 4 digits.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const child = await createChild(token, {
        display_name: cleanName,
        login_name: cleanLogin,
        age: age ? Number(age) : null,
        pin: pin || undefined,
      });

      onChildCreated({
        ...child,
        has_pin: Boolean(pin),
        login_code: child.login_code ?? null,
        created_at: child.created_at ?? new Date().toISOString(),
      });

      setName("");
      setLoginName("");
      setAge("");
      setPin("");
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to create child.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="sasa-auth-page">
      {/* SARA WHO IS WATCHING MOBILE V14 — the safe-area insets that used to
          live on this screen's inline padding now come from .sasa-auth-page
          / .sasa-auth-topbar in src/styles/app-pages.css, so every entry
          screen handles the notch and gesture bar the same way. */}
      <header className="sasa-auth-topbar">
        <span className="sasa-brand" aria-hidden="true">
          <BrandMark />
          <span className="sasa-brand-word">
            SARA<sup>kids</sup>
          </span>
        </span>

        <div className="sasa-auth-topbar-actions">
          <button type="button" className="sasa-btn is-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} />
            Add child
          </button>

          <button
            type="button"
            className="sasa-btn"
            onClick={() => {
              setShowManagePin(true);
              setManagedChildId(children.length === 1 ? String(children[0].id) : null);
              setManagePinError("");
              setManagePinSuccess("");
            }}
            disabled={children.length === 0}
          >
            <LockKeyhole size={18} />
            Manage PIN
          </button>

          <button type="button" className="sasa-btn" onClick={onOpenParentControls}>
            <Settings size={18} />
            Parent controls
          </button>

          <button type="button" className="sasa-btn is-danger" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="sasa-auth-body">
        <p className="sasa-auth-eyebrow">Signed in as {displayParentName}</p>

        <h1 className="sasa-auth-title">Who&apos;s watching?</h1>

        <p className="sasa-auth-sub">Choose a child profile, or add a new one.</p>

        {loading && (
          <div className="sasa-notice" role="status">
            <span className="sasa-spinner" aria-hidden="true" />
            Loading child profiles…
          </div>
        )}

        {error && !loading && (
          <div className="sasa-notice is-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={onRetry}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && children.length === 0 && (
          <section className="sasa-state">
            <span className="sasa-state-icon" aria-hidden="true">
              <Plus size={22} />
            </span>
            <h2>Create your first child profile</h2>
            <p>Add the child&apos;s name, age, login name, and an optional PIN.</p>
            <button type="button" className="sasa-btn is-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              Add child
            </button>
          </section>
        )}

        {!loading && !error && children.length > 0 && (
          <div className="sasa-profile-grid">
            {children.map((child) => {
              const savedImage = getSavedChildImage(child);

              return (
                <button
                  type="button"
                  key={child.id}
                  className="sasa-profile-card"
                  onClick={() => openChildProfile(child)}
                >
                  <ProfileAvatar
                    className="sasa-profile-avatar"
                    style={{ background: getDatabaseProfileColor(child.id) }}
                    image={savedImage}
                    fallback={getDatabaseProfileEmoji(child.id)}
                  />

                  <span className="sasa-profile-name">{child.display_name}</span>

                  <span className="sasa-profile-meta">
                    {child.age ? `Age ${child.age}` : "Child"}
                  </span>

                  <span
                    className={child.has_pin ? "sasa-profile-pin is-locked" : "sasa-profile-pin"}
                  >
                    {child.has_pin ? <LockKeyhole size={11} /> : null}
                    {child.has_pin ? "PIN protected" : "No PIN"}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              className="sasa-profile-card is-add"
              onClick={() => setShowForm(true)}
            >
              <Plus size={30} />
              <span className="sasa-profile-name">Add child</span>
            </button>
          </div>
        )}
      </section>

      {showForm && (
        <div
          style={{
            position: "fixed",
            zIndex: 9999,
            top: 0,
            right: 0,
            left: 0,
            // SARA_ANDROID_KEYBOARD_DIALOG_V15 — `inset: 0` sized this
            // overlay to the layout viewport, which real-device testing
            // showed does not reliably shrink when the Android keyboard
            // opens (100dvh has the same problem in this WebView). Using
            // the visualViewport-driven height here means the overlay
            // itself is never taller than what's actually visible, so the
            // section's own maxHeight/overflow below has real overflow to
            // scroll rather than content silently sitting behind the
            // keyboard with nothing to trigger a scrollbar.
            height: "var(--app-visible-height, 100dvh)",
            display: "grid",
            placeItems: "center",
            // SARA_ANDROID_AUTH_RECOVERY_V10 — matches the Manage PIN modal
            // below: without this, a short viewport (landscape phone, or the
            // keyboard covering half the screen) had no way to reach the
            // Create Child button.
            overflowY: "auto",
            // SARA WHO IS WATCHING MOBILE V14 — landscape cutout devices.
            padding:
              "max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))",
            background: "rgba(15,23,42,.6)",
          }}
        >
          <section
            style={{
              width: "min(500px, 100%)",
              // SARA_ANDROID_KEYBOARD_DIALOG_V15 — lets this dialog's own
              // content scroll internally once it's taller than the visible
              // (keyboard-aware) viewport, instead of relying solely on the
              // overlay's scroll (which centers the section and so never
              // shows a scrollbar for overflow past its own edges).
              maxHeight: "calc(var(--app-visible-height, 100dvh) - 40px)",
              overflowY: "auto",
              padding: 25,
              borderRadius: 24,
              background: "white",
            }}
          >
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Add Child</h2>
                <p style={{ color: "#64748b" }}>Create a database child profile.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  border: 0,
                  background: "#f1f5f9",
                  padding: 9,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </header>

            <div
              style={{
                display: "grid",
                gap: 15,
                marginTop: 15,
              }}
            >
              <input
                value={name}
                placeholder="Child name"
                onChange={(event) => {
                  const value = event.target.value;
                  setName(value);

                  if (!loginName) {
                    setLoginName(
                      value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, ""),
                    );
                  }
                }}
              />

              <input
                value={loginName}
                placeholder="Child login name"
                onChange={(event) => setLoginName(event.target.value)}
              />

              <input
                type="number"
                min="1"
                max="17"
                value={age}
                placeholder="Age"
                onChange={(event) => setAge(event.target.value)}
              />

              <div style={{ position: "relative" }}>
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  placeholder="Optional PIN, minimum 4 digits"
                  onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  style={{ width: "100%", paddingRight: 48 }}
                />

                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: "absolute",
                    right: 7,
                    top: 7,
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  {showPin ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              {formError && <div style={{ color: "#b91c1c" }}>{formError}</div>}

              <button
                type="button"
                onClick={saveChild}
                disabled={saving}
                style={{
                  padding: 13,
                  border: 0,
                  borderRadius: 14,
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {saving ? "Creating..." : "Create Child"}
              </button>
            </div>
          </section>
        </div>
      )}

      {pendingChild && (
        <div
          style={{
            position: "fixed",
            zIndex: 10000,
            top: 0,
            right: 0,
            left: 0,
            // SARA_ANDROID_KEYBOARD_DIALOG_V15 — see the Add Child modal
            // above for why this replaces `inset: 0`.
            height: "var(--app-visible-height, 100dvh)",
            display: "grid",
            placeItems: "center",
            // SARA_ANDROID_AUTH_RECOVERY_V10 — matches the Manage PIN modal
            // below: keeps the PIN input/submit button reachable when the
            // on-screen keyboard shrinks the visible viewport.
            overflowY: "auto",
            // SARA WHO IS WATCHING MOBILE V14 — landscape cutout devices.
            padding:
              "max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))",
            background: "rgba(15,23,42,.65)",
          }}
        >
          <section
            style={{
              width: "min(430px, 100%)",
              // SARA_ANDROID_KEYBOARD_DIALOG_V15 — see the Add Child modal
              // above; keeps Cancel/Open Profile reachable under the numeric
              // keyboard.
              maxHeight: "calc(var(--app-visible-height, 100dvh) - 40px)",
              overflowY: "auto",
              padding: 27,
              borderRadius: 25,
              background: "#ffffff",
              boxShadow: "0 30px 80px rgba(15,23,42,.35)",
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                margin: "0 auto",
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                background: getDatabaseProfileColor(pendingChild.id),
                fontSize: 42,
              }}
            >
              {getSavedChildImage(pendingChild) ? (
                <img
                  src={getSavedChildImage(pendingChild)}
                  alt={pendingChild.display_name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                getDatabaseProfileEmoji(pendingChild.id)
              )}
            </div>

            <h2
              style={{
                margin: "15px 0 5px",
                textAlign: "center",
              }}
            >
              Enter {pendingChild.display_name}&apos;s PIN
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#64748b",
                textAlign: "center",
              }}
            >
              This profile is protected.
            </p>

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                type={showChildPin ? "text" : "password"}
                value={childPin}
                inputMode="numeric"
                autoFocus
                placeholder="Enter PIN"
                onChange={(event) => {
                  setChildPin(event.target.value.replace(/\D/g, "").slice(0, 10));
                  setChildPinError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    verifyChildPin();
                  }
                }}
                style={{
                  width: "100%",
                  padding: "14px 52px 14px 15px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 14,
                  fontSize: 18,
                  letterSpacing: 4,
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={() => setShowChildPin((current) => !current)}
                style={{
                  position: "absolute",
                  top: 7,
                  right: 7,
                  width: 40,
                  height: 40,
                  display: "grid",
                  placeItems: "center",
                  border: 0,
                  borderRadius: 11,
                  background: "#f1f5f9",
                  cursor: "pointer",
                }}
              >
                {showChildPin ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {childPinError && (
              <div
                style={{
                  marginTop: 12,
                  padding: 11,
                  borderRadius: 11,
                  background: "#fff1f2",
                  color: "#b91c1c",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                {childPinError}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                type="button"
                disabled={checkingChildPin}
                onClick={() => {
                  setPendingChild(null);
                  setChildPin("");
                  setChildPinError("");
                }}
                style={{
                  padding: 13,
                  border: 0,
                  borderRadius: 13,
                  background: "#e2e8f0",
                  color: "#475569",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={checkingChildPin}
                onClick={verifyChildPin}
                style={{
                  padding: 13,
                  border: 0,
                  borderRadius: 13,
                  background: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {checkingChildPin ? "Checking..." : "Open Profile"}
              </button>
            </div>
          </section>
        </div>
      )}

      {showManagePin && (
        <div
          style={{
            position: "fixed",
            zIndex: 10020,
            top: 0,
            right: 0,
            left: 0,
            // SARA_ANDROID_KEYBOARD_DIALOG_V15 — see the Add Child modal
            // above for why this replaces `inset: 0`.
            height: "var(--app-visible-height, 100dvh)",
            display: "grid",
            placeItems: "center",
            overflowY: "auto",
            // SARA WHO IS WATCHING MOBILE V14 — landscape cutout devices.
            padding:
              "max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))",
            background: "rgba(15,23,42,.65)",
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeManagePin();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-pin-title"
            style={{
              width: "min(470px, 100%)",
              // SARA_ANDROID_KEYBOARD_DIALOG_V15 — keeps Update PIN/Cancel
              // reachable under the numeric keyboard; see the Add Child
              // modal above for the full rationale.
              maxHeight: "calc(var(--app-visible-height, 100dvh) - 40px)",
              overflowY: "auto",
              padding: 26,
              borderRadius: 25,
              background: "#ffffff",
              boxShadow: "0 30px 80px rgba(15,23,42,.35)",
            }}
          >
            <header
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 15,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    display: "grid",
                    width: 48,
                    height: 48,
                    placeItems: "center",
                    borderRadius: 14,
                    background: "#fef3c7",
                    color: "#92400e",
                  }}
                >
                  <LockKeyhole size={23} />
                </span>

                <div>
                  <h2 id="manage-pin-title" style={{ margin: 0 }}>
                    Manage Child PIN
                  </h2>

                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#64748b",
                    }}
                  >
                    Select a child and enter a new PIN.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeManagePin}
                disabled={savingManagedPin}
                aria-label="Close"
                style={{
                  display: "grid",
                  width: 40,
                  height: 40,
                  placeItems: "center",
                  border: 0,
                  borderRadius: 11,
                  background: "#f1f5f9",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </header>

            <div
              style={{
                display: "grid",
                gap: 15,
                marginTop: 22,
              }}
            >
              <label
                style={{
                  display: "grid",
                  gap: 7,
                  textAlign: "left",
                }}
              >
                <strong>Child</strong>

                <select
                  value={managedChildId ?? ""}
                  onChange={(event) => {
                    setManagedChildId(event.target.value || null);
                    setManagePinError("");
                    setManagePinSuccess("");
                  }}
                  style={{
                    width: "100%",
                    padding: "13px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 13,
                    background: "#ffffff",
                    font: "inherit",
                  }}
                >
                  <option value="">Select a child</option>

                  {children.map((child) => (
                    <option key={`pin-child-${child.id}`} value={child.id}>
                      {child.display_name}
                      {child.has_pin ? " — PIN protected" : " — No PIN"}
                    </option>
                  ))}
                </select>
              </label>

              <label
                style={{
                  display: "grid",
                  gap: 7,
                  textAlign: "left",
                }}
              >
                <strong>New PIN</strong>

                <div style={{ position: "relative" }}>
                  <input
                    type={showNewChildPin ? "text" : "password"}
                    inputMode="numeric"
                    autoComplete="new-password"
                    value={newChildPin}
                    placeholder="Minimum 4 digits"
                    onChange={(event) => {
                      setNewChildPin(event.target.value.replace(/\D/g, "").slice(0, 10));
                      setManagePinError("");
                      setManagePinSuccess("");
                    }}
                    style={{
                      width: "100%",
                      padding: "13px 52px 13px 14px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 13,
                      font: "inherit",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewChildPin((current) => !current)}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      display: "grid",
                      width: 40,
                      height: 40,
                      placeItems: "center",
                      border: 0,
                      borderRadius: 10,
                      background: "#f1f5f9",
                      cursor: "pointer",
                    }}
                    aria-label={showNewChildPin ? "Hide PIN" : "Show PIN"}
                  >
                    {showNewChildPin ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </label>

              <label
                style={{
                  display: "grid",
                  gap: 7,
                  textAlign: "left",
                }}
              >
                <strong>Confirm new PIN</strong>

                <input
                  type={showNewChildPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="new-password"
                  value={confirmChildPin}
                  placeholder="Enter the same PIN again"
                  onChange={(event) => {
                    setConfirmChildPin(event.target.value.replace(/\D/g, "").slice(0, 10));
                    setManagePinError("");
                    setManagePinSuccess("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      saveManagedPin();
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "13px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 13,
                    font: "inherit",
                  }}
                />
              </label>

              {managePinError && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 11,
                    background: "#fff1f2",
                    color: "#b91c1c",
                    fontWeight: 700,
                  }}
                >
                  {managePinError}
                </div>
              )}

              {managePinSuccess && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 11,
                    background: "#ecfdf5",
                    color: "#047857",
                    fontWeight: 700,
                  }}
                >
                  {managePinSuccess}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 3,
                }}
              >
                <button
                  type="button"
                  onClick={closeManagePin}
                  disabled={savingManagedPin}
                  style={{
                    padding: 13,
                    border: 0,
                    borderRadius: 13,
                    background: "#e2e8f0",
                    color: "#475569",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveManagedPin}
                  disabled={savingManagedPin}
                  style={{
                    padding: 13,
                    border: 0,
                    borderRadius: 13,
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 800,
                    cursor: savingManagedPin ? "wait" : "pointer",
                  }}
                >
                  {savingManagedPin ? "Saving..." : "Update PIN"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
