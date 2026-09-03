import { Delete, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { CHILD_PIN_LENGTH } from "@/lib/api";

type Props = {
  title: string;
  /** One short line. Anything longer belongs on a detail screen, not here. */
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  busy?: boolean;
  error?: string;
  success?: string;
  length?: number;
  /** Rendered above the title — a child avatar, a lock, nothing at all. */
  badge?: ReactNode;
  /** Extra control under the actions, e.g. "Use a math challenge instead". */
  footer?: ReactNode;
  autoSubmit?: boolean;
};

/**
 * SASA_PIN_SCREEN_V22 — the one PIN surface.
 *
 * Every PIN interaction in the app (parent gate, child unlock, create,
 * confirm, change, reset) renders through this so they cannot drift apart in
 * layout or in rules. Two things it deliberately does:
 *
 * - There is no text input. The custom keypad is the only entry method, so the
 *   native numeric keyboard can never open on top of it and cover the actions.
 *   Hardware keys still work through the window listener below, which is what
 *   keyboard and screen-reader users rely on.
 * - The digits are never rendered. The indicators show only how many have been
 *   entered, out of exactly the expected number.
 *
 * Sizing lives in pin.css: the whole thing is a flex column bounded by the
 * visible viewport, so the keypad and the primary action are always on screen
 * without the page itself scrolling.
 */
export function PinPad({
  title,
  hint,
  value,
  onChange,
  onSubmit,
  onCancel,
  cancelLabel = "Back",
  submitLabel = "Unlock",
  busy = false,
  error,
  success,
  length = CHILD_PIN_LENGTH,
  badge,
  footer,
  autoSubmit = false,
}: Props) {
  // Every PIN surface shares this, so none of them can be dragged around
  // while the pad is up.
  useScrollLock();

  const complete = value.length === length;
  const submittedFor = useRef<string | null>(null);

  /* Taps are read from a ref rather than the `value` prop. React batches state
   * updates, so two taps landing in the same batch both saw the same stale
   * prop and the second overwrote the first instead of appending — measured as
   * four rapid taps producing a single digit. Someone entering a PIN taps
   * fast, so this is the normal case, not an edge case. The ref advances
   * synchronously on every press and is resynced whenever the owner changes
   * the value for any other reason. */
  const latest = useRef(value);

  useEffect(() => {
    latest.current = value;
  }, [value]);

  const commit = (next: string) => {
    latest.current = next;
    onChange(next);
  };

  const press = (digit: string) => {
    if (busy || latest.current.length >= length) return;
    commit(latest.current + digit);
  };

  const back = () => {
    if (busy) return;
    commit(latest.current.slice(0, -1));
  };

  const clear = () => {
    if (busy) return;
    commit("");
  };

  const submit = () => {
    if (busy || !complete) return;
    // Guards a double tap and an Enter arriving on top of an auto-submit.
    if (submittedFor.current === value) return;
    submittedFor.current = value;
    onSubmit();
  };

  useEffect(() => {
    if (value.length < length) submittedFor.current = null;
  }, [value, length]);

  useEffect(() => {
    if (!autoSubmit || !complete || busy) return;
    if (submittedFor.current === value) return;
    submittedFor.current = value;
    onSubmit();
  }, [autoSubmit, complete, busy, value, onSubmit]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= "0" && event.key <= "9") {
        event.preventDefault();
        press(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        back();
      } else if (event.key === "Enter") {
        event.preventDefault();
        submit();
      } else if (event.key === "Escape" && onCancel) {
        event.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="sasa-pin">
      {badge ? <div className="sasa-pin-badge">{badge}</div> : null}

      <h2 className="sasa-pin-title">{title}</h2>
      {hint ? <p className="sasa-pin-hint">{hint}</p> : null}

      <div
        className="sasa-pin-dots"
        role="status"
        aria-label={`${value.length} of ${length} digits entered`}
      >
        {Array.from({ length }).map((_, index) => (
          <span key={index} className={index < value.length ? "is-filled" : undefined} />
        ))}
      </div>

      <p className={error ? "sasa-pin-msg is-error" : "sasa-pin-msg"} role="alert">
        {error || success || " "}
      </p>

      <div className="sasa-pin-keys">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <button key={digit} type="button" onClick={() => press(digit)} disabled={busy}>
            {digit}
          </button>
        ))}

        <button
          type="button"
          className="is-soft"
          onClick={clear}
          disabled={busy}
          aria-label="Clear"
        >
          <X size={18} />
        </button>

        <button type="button" onClick={() => press("0")} disabled={busy}>
          0
        </button>

        <button
          type="button"
          className="is-soft"
          onClick={back}
          disabled={busy}
          aria-label="Delete last digit"
        >
          <Delete size={18} />
        </button>
      </div>

      <div className="sasa-pin-actions">
        {onCancel ? (
          <button type="button" className="sasa-pin-btn" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
        ) : null}

        <button
          type="button"
          className="sasa-pin-btn is-primary"
          onClick={submit}
          disabled={busy || !complete}
        >
          {busy ? "Checking…" : submitLabel}
        </button>
      </div>

      {footer ? <div className="sasa-pin-footer">{footer}</div> : null}
    </div>
  );
}

export default PinPad;
