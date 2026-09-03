/* SASA_VIDEO_THUMBNAILS_V21
 *
 * Grabs a still from a video the parent has just picked, before it is
 * uploaded, so the form can show what the video actually contains instead of a
 * grey box while the request is in flight. This is a local preview only — the
 * permanent thumbnail is produced server-side from the stored file, so every
 * user and device sees the same image.
 *
 * Everything happens against an object URL in the page; the file is never read
 * into memory as a whole and the URL is always revoked.
 */

const PREVIEW_MAX_WIDTH = 640;
const CAPTURE_TIMEOUT_MS = 8000;

export async function captureLocalVideoFrame(file: File): Promise<string | null> {
  if (typeof document === "undefined" || !file.type.startsWith("video/")) {
    return null;
  }

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");

  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.src = objectUrl;

  const cleanup = () => {
    URL.revokeObjectURL(objectUrl);
    video.removeAttribute("src");
    video.load();
  };

  try {
    return await new Promise<string | null>((resolve) => {
      const timer = window.setTimeout(() => resolve(null), CAPTURE_TIMEOUT_MS);

      const finish = (value: string | null) => {
        window.clearTimeout(timer);
        resolve(value);
      };

      video.onerror = () => finish(null);

      video.onloadedmetadata = () => {
        // Same idea as the server: a little way in, past any opening fade.
        const target =
          Number.isFinite(video.duration) && video.duration > 0
            ? Math.min(video.duration - 0.1, Math.max(0.3, video.duration * 0.15))
            : 1;

        video.currentTime = target;
      };

      video.onseeked = () => {
        try {
          const width = video.videoWidth;
          const height = video.videoHeight;

          if (!width || !height) return finish(null);

          const scale = Math.min(1, PREVIEW_MAX_WIDTH / width);
          const canvas = document.createElement("canvas");

          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));

          const context = canvas.getContext("2d");

          if (!context) return finish(null);

          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          finish(canvas.toDataURL("image/jpeg", 0.7));
        } catch {
          // Tainted canvas or an unsupported codec — the caller falls back.
          finish(null);
        }
      };
    });
  } finally {
    cleanup();
  }
}
