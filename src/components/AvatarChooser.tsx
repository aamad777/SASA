import { Check, ImagePlus, Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { setProfileAvatarPreset, uploadProfileAvatar, type AvatarCrop } from "@/lib/api";

type Props = {
  token: string;
  profileId: string;
  profileName: string;
  presets: string[];
  currentEmoji: string;
  onClose: () => void;
  onSaved: (avatarUrl: string) => void;
};

const STAGE = 240;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * SASA_AVATAR_UI_V25 — pick a built-in avatar or crop a photo from the device.
 *
 * The crop is a plain pan/zoom over a square stage rather than a drag library:
 * the child moves the picture with a finger and zooms with the slider or the
 * +/- buttons, and what the square shows is exactly what gets saved. The
 * rectangle is converted back to source pixels and sent to the backend, which
 * re-crops, re-encodes to WebP and strips metadata - the browser never
 * produces the stored file, so a tampered client cannot smuggle one in.
 *
 * File selection uses a plain <input type="file">, so Android shows the system
 * picker and the app asks for no camera or storage permission of its own.
 */
export function AvatarChooser({
  token,
  profileId,
  profileName,
  presets,
  currentEmoji,
  onClose,
  onSaved,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const savingRef = useRef(false);

  useScrollLock();

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const pick = (picked: File | null) => {
    setError("");

    if (!picked) return;

    // Checked again server-side by real magic bytes; this is only so the
    // child finds out immediately rather than after an upload.
    if (!ACCEPTED.includes(picked.type)) {
      setError("Choose a JPG, PNG or WebP picture.");
      return;
    }

    if (picked.size > MAX_BYTES) {
      setError("That picture is larger than 5 MB. Try a smaller one.");
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);

    const url = URL.createObjectURL(picked);

    if (!url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
      return;
    }

    const image = new Image();

    image.onload = () => {
      setNatural({ width: image.naturalWidth, height: image.naturalHeight });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    image.src = url;

    setObjectUrl(url);
    setFile(picked);
  };

  /** Stage rectangle back to source pixels. */
  const cropRect = useCallback((): AvatarCrop | undefined => {
    if (!natural.width || !natural.height) return undefined;

    const base = Math.max(STAGE / natural.width, STAGE / natural.height);
    const scale = base * zoom;
    const drawnW = natural.width * scale;
    const drawnH = natural.height * scale;
    const left = (STAGE - drawnW) / 2 + offset.x;
    const top = (STAGE - drawnH) / 2 + offset.y;

    return {
      x: Math.max(0, Math.round(-left / scale)),
      y: Math.max(0, Math.round(-top / scale)),
      width: Math.round(STAGE / scale),
      height: Math.round(STAGE / scale),
    };
  }, [natural, zoom, offset]);

  const savePreset = async (emoji: string) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setBusy(true);
    setError("");

    try {
      const result = await setProfileAvatarPreset(token, profileId, emoji);
      onSaved(result.avatar_url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that avatar.");
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  };

  const savePhoto = async () => {
    if (savingRef.current || !file) return;
    savingRef.current = true;
    setBusy(true);
    setError("");

    try {
      const result = await uploadProfileAvatar(token, profileId, file, cropRect(), setProgress);
      onSaved(result.avatar_url);
      onClose();
    } catch (err) {
      // The backend keeps the previous avatar when a replacement fails, so
      // there is nothing to undo here - just say what happened.
      setError(err instanceof Error ? err.message : "Could not save that photo.");
    } finally {
      savingRef.current = false;
      setBusy(false);
      setProgress(0);
    }
  };

  const startDrag = (x: number, y: number) => {
    dragRef.current = { x: x - offset.x, y: y - offset.y };
  };

  const moveDrag = (x: number, y: number) => {
    if (!dragRef.current) return;
    setOffset({ x: x - dragRef.current.x, y: y - dragRef.current.y });
  };

  return (
    <div
      className="sasa-sheet-scrim-full"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="sasa-formsheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Choose an avatar for ${profileName}`}
      >
        <header className="sasa-formsheet-head">
          <h2>{profileName}&apos;s picture</h2>
          <button
            type="button"
            className="sasa-iconbtn"
            aria-label="Close"
            onClick={onClose}
            disabled={busy}
          >
            <X size={20} />
          </button>
        </header>

        <div className="sasa-formsheet-body">
          {!file ? (
            <>
              <fieldset className="sasa-field sasa-avatar-pick">
                <legend>Pick a character</legend>
                <div>
                  {presets.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={emoji === currentEmoji ? "is-selected" : undefined}
                      aria-label={`Use ${emoji}`}
                      disabled={busy}
                      onClick={() => savePreset(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="sasa-avatar-upload">
                <ImagePlus size={18} />
                <span>Upload a photo</span>
                {/* Plain file input: the system picker, no extra permission. */}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={(event) => pick(event.target.files?.[0] || null)}
                />
              </label>
            </>
          ) : (
            <>
              <p className="sasa-avatar-hint">Drag to move, and zoom until it looks right.</p>

              <div
                className="sasa-avatar-stage"
                style={{ width: STAGE, height: STAGE }}
                onMouseDown={(event) => startDrag(event.clientX, event.clientY)}
                onMouseMove={(event) =>
                  event.buttons === 1 && moveDrag(event.clientX, event.clientY)
                }
                onMouseUp={() => (dragRef.current = null)}
                onMouseLeave={() => (dragRef.current = null)}
                onTouchStart={(event) =>
                  startDrag(event.touches[0].clientX, event.touches[0].clientY)
                }
                onTouchMove={(event) =>
                  moveDrag(event.touches[0].clientX, event.touches[0].clientY)
                }
                onTouchEnd={() => (dragRef.current = null)}
              >
                {objectUrl ? (
                  <img
                    src={objectUrl}
                    alt=""
                    draggable={false}
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    }}
                  />
                ) : null}
              </div>

              <div className="sasa-avatar-zoom">
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  aria-label="Zoom"
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                >
                  <Plus size={16} />
                </button>
              </div>

              {busy ? (
                <div
                  className="sasa-admin-progress"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span style={{ width: `${progress}%` }} />
                  <em>Saving… {progress}%</em>
                </div>
              ) : null}
            </>
          )}

          {error ? (
            <p className="sasa-formsheet-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="sasa-formsheet-foot">
          <button
            type="button"
            className="sasa-pin-btn"
            disabled={busy}
            onClick={() => (file ? (setFile(null), setError("")) : onClose())}
          >
            {file ? "Back" : "Cancel"}
          </button>

          {file ? (
            <button
              type="button"
              className="sasa-pin-btn is-primary"
              onClick={savePhoto}
              disabled={busy}
            >
              <Check size={16} /> {busy ? "Saving…" : "Save picture"}
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}

export default AvatarChooser;
