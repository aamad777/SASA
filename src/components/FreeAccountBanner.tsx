import { useState } from "react";
import { Sparkles, UserPlus, X } from "lucide-react";
import { playPopSound, playSuccessSound } from "../lib/sound";

type FreeAccountBannerProps = {
  onCreateAccount: () => void;
  className?: string;
};

/**
 * Guest-mode strip shown above the profile picker. Wraps rather than
 * truncating on narrow phones — the copy used to be cut mid-word at 360px.
 */
export default function FreeAccountBanner({
  onCreateAccount,
  className = "",
}: FreeAccountBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`sasa-guestbar ${className}`.trim()}>
      <span className="sasa-guestbar-icon" aria-hidden="true">
        <Sparkles size={18} />
      </span>

      <div className="sasa-guestbar-text">
        <strong>Free guest account</strong>
        <span>Create an account to keep profiles, time limits and history.</span>
      </div>

      <button
        type="button"
        className="sasa-btn is-primary"
        onClick={() => {
          playSuccessSound();
          onCreateAccount();
        }}
      >
        <UserPlus size={16} />
        Create account
      </button>

      <button
        type="button"
        className="sasa-iconbtn"
        onClick={() => {
          playPopSound();
          setDismissed(true);
        }}
        aria-label="Dismiss this message"
      >
        <X size={18} />
      </button>
    </div>
  );
}
