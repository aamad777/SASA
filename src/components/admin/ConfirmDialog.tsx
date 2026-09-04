import { useEffect, useState } from "react";
import { useScrollLock } from "@/hooks/use-scroll-lock";

type Props = {
  title: string;
  body: string;
  confirmLabel: string;
  /** When set, the phrase must be typed exactly before the action is enabled. */
  requirePhrase?: string;
  busy?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * SASA_ADMIN_UI_V25 — confirmation for administrative actions.
 *
 * Destructive operations pass `requirePhrase`, so the administrator has to type
 * the exact phrase before the button becomes usable — a deliberate speed bump
 * on an action that affects somebody else's family.
 */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  requirePhrase,
  busy = false,
  error,
  onCancel,
  onConfirm,
}: Props) {
  const [typed, setTyped] = useState("");

  useScrollLock();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  const ready = !requirePhrase || typed.trim() === requirePhrase;

  return (
    <div
      className="sasa-sheet-scrim-full"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section className="sasa-formsheet" role="dialog" aria-modal="true" aria-label={title}>
        <header className="sasa-formsheet-head">
          <h2>{title}</h2>
        </header>

        <div className="sasa-formsheet-body">
          <p className="sasa-admin-confirmtext">{body}</p>

          {requirePhrase ? (
            <label className="sasa-field">
              <span>
                Type <code>{requirePhrase}</code> to confirm
              </span>
              <input
                value={typed}
                autoComplete="off"
                onChange={(event) => setTyped(event.target.value)}
                placeholder={requirePhrase}
              />
            </label>
          ) : null}

          {error ? (
            <p className="sasa-formsheet-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="sasa-formsheet-foot">
          <button type="button" className="sasa-pin-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="sasa-pin-btn is-primary"
            onClick={onConfirm}
            disabled={busy || !ready}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default ConfirmDialog;
