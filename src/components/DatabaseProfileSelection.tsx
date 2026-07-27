import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Plus, X } from "lucide-react";

import { createChild, loginChild, setChildPin, type DatabaseChild } from "../lib/api";

type Props = {
  token: string;
  children: DatabaseChild[];
  loading: boolean;
  error: string;
  parentName: string;
  onSelectChild: (child: DatabaseChild) => void;
  onChildCreated: (child: DatabaseChild) => void;
  onChildPinChanged: (childId: number) => void;
  onRetry: () => void;
  onLogout: () => void;
};

const emojis = ["🦁", "🐼", "🐰", "🐻", "🦊", "🐸"];
const colors = ["#ffa62b", "#95d5b2", "#ff8fa3", "#8ecae6", "#c89f7a", "#b8e986"];

export function getDatabaseProfileEmoji(childId: number): string {
  return emojis[Math.abs(childId) % emojis.length];
}

export function getDatabaseProfileColor(childId: number): string {
  return colors[Math.abs(childId) % colors.length];
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
  onLogout,
}: Props) {
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

  const [managedChildId, setManagedChildId] = useState<number | null>(null);

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
      const result = await loginChild(pendingChild.login_name, childPin);

      localStorage.setItem("sasa-child-token", result.token);

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
      await setChildPin(token, managedChildId, newChildPin);

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
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "linear-gradient(135deg, #eff6ff, #fdf2f8)",
      }}
    >
      <header
        style={{
          maxWidth: 1050,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <small style={{ color: "#64748b" }}>Connected parent</small>

          <h2 style={{ margin: "4px 0 0" }}>{parentName}</h2>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "11px 16px",
              border: 0,
              borderRadius: 14,
              background: "#2563eb",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <Plus size={18} />
            Add Child
          </button>

          <button
            type="button"
            onClick={() => {
              setShowManagePin(true);
              setManagedChildId(children.length === 1 ? children[0].id : null);
              setManagePinError("");
              setManagePinSuccess("");
            }}
            disabled={children.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "11px 16px",
              border: 0,
              borderRadius: 14,
              background: children.length === 0 ? "#e2e8f0" : "#fef3c7",
              color: children.length === 0 ? "#94a3b8" : "#92400e",
              fontWeight: 800,
              cursor: children.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            <LockKeyhole size={18} />
            Manage PIN
          </button>

          <button
            type="button"
            onClick={onLogout}
            style={{
              padding: "11px 16px",
              border: 0,
              borderRadius: 14,
              background: "#fee2e2",
              color: "#b91c1c",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <section
        style={{
          maxWidth: 1050,
          margin: "70px auto 0",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 30 }}>☁️ ⭐ 🌈</div>

        <h1 style={{ fontSize: 48, margin: "10px 0" }}>Who&apos;s Watching?</h1>

        <p style={{ color: "#64748b" }}>Select an existing child or create a new profile.</p>

        {loading && <p>Loading child profiles...</p>}

        {error && !loading && (
          <div>
            <p style={{ color: "#b91c1c" }}>{error}</p>
            <button type="button" onClick={onRetry}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && children.length === 0 && (
          <div
            style={{
              maxWidth: 470,
              margin: "35px auto",
              padding: 35,
              borderRadius: 26,
              background: "white",
              boxShadow: "0 18px 45px rgba(15,23,42,.12)",
            }}
          >
            <Plus size={48} color="#2563eb" />

            <h2>Create your first child profile</h2>

            <p style={{ color: "#64748b" }}>
              Add the child&apos;s name, age, login name, and optional PIN.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              style={{
                padding: "13px 20px",
                border: 0,
                borderRadius: 14,
                background: "#2563eb",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Add Child
            </button>
          </div>
        )}

        {!loading && !error && children.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 24,
              marginTop: 35,
            }}
          >
            {children.map((child) => (
              <button
                type="button"
                key={child.id}
                onClick={() => openChildProfile(child)}
                style={{
                  width: 180,
                  padding: 20,
                  border: 0,
                  borderRadius: 26,
                  background: "white",
                  boxShadow: "0 14px 35px rgba(15,23,42,.12)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 115,
                    height: 115,
                    margin: "0 auto",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    background: getDatabaseProfileColor(child.id),
                    fontSize: 58,
                  }}
                >
                  {getSavedChildImage(child) ? (
                    <img
                      src={getSavedChildImage(child)}
                      alt={child.display_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    getDatabaseProfileEmoji(child.id)
                  )}
                </div>

                <h2>{child.display_name}</h2>

                <p style={{ color: "#64748b" }}>{child.age ? `Age ${child.age}` : "Child"}</p>

                <small>{child.has_pin ? "🔒 PIN protected" : "No PIN"}</small>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowForm(true)}
              style={{
                width: 180,
                minHeight: 245,
                border: "2px dashed #93c5fd",
                borderRadius: 26,
                background: "#eff6ff",
                color: "#2563eb",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <Plus size={42} />
              <div style={{ marginTop: 10 }}>Add Child</div>
            </button>
          </div>
        )}
      </section>

      {showForm && (
        <div
          style={{
            position: "fixed",
            zIndex: 9999,
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 20,
            background: "rgba(15,23,42,.6)",
          }}
        >
          <section
            style={{
              width: "min(500px, 100%)",
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
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 20,
            background: "rgba(15,23,42,.65)",
          }}
        >
          <section
            style={{
              width: "min(430px, 100%)",
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
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 20,
            overflowY: "auto",
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
                    setManagedChildId(event.target.value ? Number(event.target.value) : null);
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
