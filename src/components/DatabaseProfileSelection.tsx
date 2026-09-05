import { useRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Plus, X, Settings } from "lucide-react";
import BrandMark from "./layout/BrandMark";
import ProfileAvatar from "./layout/ProfileAvatar";
import PinPad from "./pin/PinPad";
import { useScrollLock } from "@/hooks/use-scroll-lock";

// SARA_PIN_RESET_V5 — aliased on import: this file also declares a local
// `setChildPin` state setter (useState below) for the *verify* PIN input.
// The previous unaliased import let that local declaration silently shadow
// this API function for the whole component, so "Update PIN" was actually
// calling the React state setter (which just no-ops on 3 arguments) instead
// of ever hitting the backend — it looked like it saved but nothing changed.
import {
  CHILD_PIN_LENGTH,
  createChild,
  isValidChildPin,
  loginChild,
  selectChildProfile,
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

/** The avatar presets a parent can choose; stored as "emoji:<char>". */
const AVATAR_CHOICES = emojis;

function slugifyLogin(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
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
  const [avatar, setAvatar] = useState("");
  const [loginTouched, setLoginTouched] = useState(false);
  /* SASA_CHILD_CREATE_V22 — a ref, not the `saving` state, because several
   * clicks landing in the same tick all read the same pre-update state value
   * and every one of them fired a POST. Measured: three taps produced three
   * requests. A ref flips synchronously on the first call. */
  const creatingRef = useRef(false);

  // The create/edit sheet is the one PIN-adjacent surface with real text
  // inputs, so it meets the native keyboard; freeze the page behind it too.
  useScrollLock(showForm);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; login?: string; pin?: string }>(
    {},
  );
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
  const [pinStep, setPinStep] = useState<"enter" | "confirm">("enter");

  const [managedChildId, setManagedChildId] = useState<string | null>(null);

  const [newChildPin, setNewChildPin] = useState("");

  const [confirmChildPin, setConfirmChildPin] = useState("");

  const [showNewChildPin, setShowNewChildPin] = useState(false);

  const [openingChildId, setOpeningChildId] = useState<string | null>(null);

  const [managePinError, setManagePinError] = useState("");

  const [managePinSuccess, setManagePinSuccess] = useState("");

  const [savingManagedPin, setSavingManagedPin] = useState(false);

  const openChildProfile = async (child: DatabaseChild) => {
    // SASA_CHILD_PIN_V20 — a child with no PIN is opened through the backend on
    // the signed-in parent's token, not by the client deciding on its own. The
    // server re-checks ownership and refuses if the child does have a PIN, so
    // this is an authorization check rather than a frontend shortcut.
    if (!child.has_pin) {
      setOpeningChildId(child.id);
      setChildPinError("");

      try {
        const opened = await selectChildProfile(token, child.id);

        /* SASA_FRIENDS_V32 — keep the child-scoped token the server issues.
         * Friends and sharing act AS the child, so they must run on the
         * child's own session; using the parent's token would let a child
         * act with parent privileges. */
        if (opened?.token) localStorage.setItem("sasa-child-token", opened.token);
        else localStorage.removeItem("sasa-child-token");

        onSelectChild(child);
      } catch (error) {
        setPendingChild(child);
        setChildPinError(
          error instanceof Error ? error.message : "Unable to open this child profile.",
        );
      } finally {
        setOpeningChildId(null);
      }

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

  const closeChildPin = () => {
    setPendingChild(null);
    setChildPin("");
    setChildPinError("");
  };

  const verifyChildPin = async () => {
    if (!pendingChild?.login_name) {
      return;
    }

    if (!isValidChildPin(childPin)) {
      setChildPinError(`Enter the ${CHILD_PIN_LENGTH}-digit PIN.`);
      return;
    }

    setCheckingChildPin(true);
    setChildPinError("");

    try {
      const session = await loginChild(pendingChild.login_name, childPin);

      // Same reasoning as the PIN-less path above.
      if (session?.token) localStorage.setItem("sasa-child-token", session.token);
      else localStorage.removeItem("sasa-child-token");

      const verifiedChild = pendingChild;

      setPendingChild(null);
      setChildPin("");
      setShowChildPin(false);

      onSelectChild(verifiedChild);
    } catch (error) {
      setChildPinError(error instanceof Error ? error.message : "Wrong child PIN.");
      /* Clear the entered digits after a rejected attempt. Without this the
       * indicators stayed full, every further tap was ignored because the PIN
       * was already at its full length, and the only way to try again was to
       * hit Clear — which reads as the screen having frozen. */
      setChildPin("");
    } finally {
      setCheckingChildPin(false);
    }
  };

  const managedChild = children.find((child) => child.id === managedChildId) ?? null;

  const clearManagedPin = async () => {
    if (!managedChildId || savingManagedPin) return;

    setSavingManagedPin(true);
    setManagePinError("");

    try {
      // The backend treats an empty pin as "remove it", which is the reset case.
      await updateChildPin(token, managedChildId, "");
      onChildPinChanged(managedChildId);
      setManagePinSuccess("PIN removed.");
      window.setTimeout(() => closeManagePin(), 900);
    } catch (error) {
      setManagePinError(error instanceof Error ? error.message : "Unable to remove the PIN.");
    } finally {
      setSavingManagedPin(false);
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
    setPinStep("enter");
  };

  const saveManagedPin = async () => {
    if (!managedChildId) {
      setManagePinError("Select a child.");
      return;
    }

    if (!isValidChildPin(newChildPin)) {
      setManagePinError(`The PIN must be exactly ${CHILD_PIN_LENGTH} digits.`);
      setPinStep("enter");
      return;
    }

    if (newChildPin !== confirmChildPin) {
      setManagePinError("Those did not match. Try the confirmation again.");
      setConfirmChildPin("");
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
      setPinStep("enter");

      window.setTimeout(() => {
        closeManagePin();
      }, 900);
    } catch (error) {
      setManagePinError(error instanceof Error ? error.message : "Unable to update child PIN.");
    } finally {
      setSavingManagedPin(false);
    }
  };

  /* SASA_CHILD_CREATE_V22 — the Create button is enabled only for input the
   * backend will actually accept, so the form cannot invite a request that is
   * guaranteed to fail. The PIN is the case that used to break: the field
   * advertised "minimum 4 digits" and allowed ten, while the API requires
   * exactly four. */
  const isFormValid =
    name.trim().length > 0 &&
    loginName.trim().length > 0 &&
    (pin.length === 0 || isValidChildPin(pin));

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setFormError("");
    setFieldErrors({});
  };

  const saveChild = async () => {
    // Guards a second tap landing before the button re-renders as disabled.
    if (creatingRef.current) return;

    const cleanName = name.trim();
    const cleanLogin = loginName.trim().toLowerCase();
    const errors: { name?: string; login?: string; pin?: string } = {};

    if (!cleanName) errors.name = "Enter the child name.";
    if (!cleanLogin) errors.login = "Enter a login name.";
    if (pin && !isValidChildPin(pin))
      errors.pin = `The PIN must be exactly ${CHILD_PIN_LENGTH} digits.`;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormError("");
      return;
    }

    creatingRef.current = true;
    setSaving(true);
    setFormError("");

    try {
      const child = await createChild(token, {
        display_name: cleanName,
        login_name: cleanLogin,
        age: age ? Number(age) : null,
        pin: pin || undefined,
        avatar_url: avatar ? `emoji:${avatar}` : undefined,
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
      setAvatar("");
      setLoginTouched(false);
      setFieldErrors({});
      setShowForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create child.";

      // Put the server's answer next to the field it is about, so a duplicate
      // login name does not read as a generic failure.
      if (/login id already exists|child login/i.test(message)) {
        setFieldErrors((current) => ({ ...current, login: "That login name is already taken." }));
      } else if (/pin/i.test(message)) {
        setFieldErrors((current) => ({ ...current, pin: message }));
      } else {
        setFormError(message);
      }
    } finally {
      creatingRef.current = false;
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
          className="sasa-sheet-scrim-full"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          {/* SASA_CHILD_CREATE_V22 — a full-height sheet on phones and a
              centred card from 640px up. Header and actions are pinned; only
              the field list between them scrolls, so Cancel and Create are
              never pushed under the keyboard or the bottom bar. */}
          <section
            className="sasa-formsheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-child-title"
          >
            <header className="sasa-formsheet-head">
              <h2 id="add-child-title">Add a child</h2>
              <button type="button" className="sasa-iconbtn" aria-label="Close" onClick={closeForm}>
                <X size={20} />
              </button>
            </header>

            <div className="sasa-formsheet-body">
              <label className="sasa-field">
                <span>
                  Child name <em>required</em>
                </span>
                <input
                  value={name}
                  autoComplete="off"
                  aria-invalid={Boolean(fieldErrors.name)}
                  placeholder="e.g. Sara"
                  onChange={(event) => {
                    const value = event.target.value;
                    setName(value);
                    setFieldErrors((current) => ({ ...current, name: "" }));

                    if (!loginTouched) setLoginName(slugifyLogin(value));
                  }}
                />
                {fieldErrors.name ? <strong>{fieldErrors.name}</strong> : null}
              </label>

              <label className="sasa-field">
                <span>
                  Login name <em>required</em>
                </span>
                <input
                  value={loginName}
                  autoComplete="off"
                  aria-invalid={Boolean(fieldErrors.login)}
                  placeholder="e.g. sara"
                  onChange={(event) => {
                    setLoginTouched(true);
                    setLoginName(slugifyLogin(event.target.value));
                    setFieldErrors((current) => ({ ...current, login: "" }));
                  }}
                />
                {fieldErrors.login ? (
                  <strong>{fieldErrors.login}</strong>
                ) : (
                  <small>Used to sign this child in. Letters, numbers and dashes.</small>
                )}
              </label>

              <fieldset className="sasa-field sasa-avatar-pick">
                <legend>Avatar</legend>
                <div>
                  {AVATAR_CHOICES.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      className={avatar === choice ? "is-selected" : undefined}
                      aria-pressed={avatar === choice}
                      aria-label={`Choose ${choice}`}
                      onClick={() => setAvatar(avatar === choice ? "" : choice)}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="sasa-field">
                <span>
                  Age <em className="is-optional">optional</em>
                </span>
                <input
                  type="number"
                  min="1"
                  max="17"
                  value={age}
                  placeholder="6"
                  onChange={(event) => setAge(event.target.value)}
                />
              </label>

              <label className="sasa-field">
                <span>
                  PIN <em className="is-optional">optional</em>
                </span>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  aria-invalid={Boolean(fieldErrors.pin)}
                  placeholder={`${CHILD_PIN_LENGTH} digits`}
                  onChange={(event) => {
                    setPin(event.target.value.replace(/\D/g, "").slice(0, CHILD_PIN_LENGTH));
                    setFieldErrors((current) => ({ ...current, pin: "" }));
                  }}
                />
                {fieldErrors.pin ? (
                  <strong>{fieldErrors.pin}</strong>
                ) : (
                  <small>
                    Leave empty for no PIN. With a PIN, this child is asked for it before their
                    profile opens.
                  </small>
                )}
              </label>

              {formError ? (
                <p className="sasa-formsheet-error" role="alert">
                  {formError}
                </p>
              ) : null}
            </div>

            <footer className="sasa-formsheet-foot">
              <button type="button" className="sasa-pin-btn" onClick={closeForm} disabled={saving}>
                Cancel
              </button>
              <button
                type="button"
                className="sasa-pin-btn is-primary"
                onClick={saveChild}
                disabled={saving || !isFormValid}
              >
                {saving ? "Creating…" : "Create child"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {pendingChild && (
        <div
          className="sasa-pin-scrim"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeChildPin();
          }}
        >
          <PinPad
            title={`Enter ${pendingChild.display_name}'s PIN`}
            hint="This profile is protected."
            badge={
              <ProfileAvatar
                image={getSavedChildImage(pendingChild)}
                fallback={getDatabaseProfileEmoji(pendingChild.id)}
              />
            }
            value={childPin}
            onChange={(next) => {
              setChildPin(next);
              setChildPinError("");
            }}
            onSubmit={verifyChildPin}
            onCancel={closeChildPin}
            cancelLabel="Cancel"
            submitLabel="Open Profile"
            busy={checkingChildPin}
            error={childPinError}
            autoSubmit
          />
        </div>
      )}

      {showManagePin && (
        <div
          className="sasa-pin-scrim"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeManagePin();
          }}
        >
          {/* SASA_PIN_SCREEN_V22 — set / change / reset runs through the same
              pad as every other PIN surface: pick the child, enter, confirm.
              The child step replaces the dropdown the old dialog used; a list
              of tappable rows fits the narrow pad and meets the touch target
              minimum, which a native select control did not. */}
          {!managedChildId ? (
            <div className="sasa-pin">
              <h2 className="sasa-pin-title">Manage a child PIN</h2>
              <p className="sasa-pin-hint">Choose whose PIN you want to set or change.</p>

              <div className="sasa-pin-childlist">
                {children.length === 0 ? (
                  <p className="sasa-pin-hint">Add a child first.</p>
                ) : (
                  children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => {
                        setManagedChildId(child.id);
                        setPinStep("enter");
                        setNewChildPin("");
                        setConfirmChildPin("");
                        setManagePinError("");
                      }}
                    >
                      <span aria-hidden="true">{getDatabaseProfileEmoji(child.id)}</span>
                      <span>{child.display_name}</span>
                      <small>{child.has_pin ? "PIN set" : "No PIN"}</small>
                    </button>
                  ))
                )}
              </div>

              <div className="sasa-pin-actions">
                <button type="button" className="sasa-pin-btn" onClick={closeManagePin}>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <PinPad
              title={pinStep === "confirm" ? "Confirm the new PIN" : "Set a new PIN"}
              hint={
                pinStep === "confirm"
                  ? "Enter the same digits again."
                  : managedChild
                    ? `${managedChild.display_name} will use this to open their profile.`
                    : "Choose a child first."
              }
              badge={managedChild ? getDatabaseProfileEmoji(managedChild.id) : "🔐"}
              value={pinStep === "confirm" ? confirmChildPin : newChildPin}
              onChange={(next) => {
                setManagePinError("");
                if (pinStep === "confirm") setConfirmChildPin(next);
                else setNewChildPin(next);
              }}
              onSubmit={() => {
                if (pinStep === "enter") {
                  setPinStep("confirm");
                  setConfirmChildPin("");
                  return;
                }
                saveManagedPin();
              }}
              onCancel={() => {
                if (pinStep === "confirm") {
                  setPinStep("enter");
                  setConfirmChildPin("");
                  setManagePinError("");
                  return;
                }
                closeManagePin();
              }}
              cancelLabel={pinStep === "confirm" ? "Back" : "Cancel"}
              submitLabel={pinStep === "confirm" ? "Save PIN" : "Next"}
              busy={savingManagedPin}
              error={managePinError}
              success={managePinSuccess}
              autoSubmit={pinStep === "enter"}
              footer={
                <button
                  type="button"
                  className="sasa-pin-linkbtn"
                  onClick={clearManagedPin}
                  disabled={savingManagedPin || !managedChildId}
                >
                  Remove this child&apos;s PIN
                </button>
              }
            />
          )}
        </div>
      )}
    </main>
  );
}
