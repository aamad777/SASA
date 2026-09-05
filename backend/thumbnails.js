/* SASA_VIDEO_THUMBNAILS_V21
 *
 * Extracts a representative still from an uploaded video and stores it next to
 * the video in the existing uploads directory.
 *
 * Safety notes, because this is the one place the API shells out:
 *   - every call uses execFile with an argument array, never a shell string, so
 *     a filename can never be interpreted as a command;
 *   - the video path is resolved and asserted to live inside the uploads
 *     directory before anything runs, which blocks path traversal via a crafted
 *     stored filename;
 *   - every ffmpeg/ffprobe invocation has a hard timeout and a bounded output
 *     buffer, so a malformed file cannot hang or balloon the process;
 *   - ffprobe is also the validation step: a file that reports no video stream
 *     is rejected before any frame work is attempted.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";

const execFileAsync = promisify(execFile);

export const THUMB_WIDTH = 1280;
export const THUMB_HEIGHT = 720;

/* SASA_ASYNC_THUMBNAILS_V27 — tightened from 15s/30s.
 *
 * The old budget was 15s probe + 4 candidates x 30s + 30s write = ~165s worst
 * case, which is what pushed an upload past Cloudflare's ~100s proxy limit
 * back when this ran inside the request. Generation is off the request now,
 * but an unbounded job still ties up the single worker and delays every video
 * queued behind it, so the ceiling still matters.
 *
 * Seeking to a timestamp and decoding one frame is fast even for large files;
 * anything past these limits means a damaged or pathological stream that a
 * longer wait will not rescue. The candidate ladder below drops from four
 * entries to three, keeping the spread across the opening quarter that avoids
 * black frames. New worst case: 10 + 3x12 + 12 = 58s. */
const PROBE_TIMEOUT_MS = 10_000;
const FRAME_TIMEOUT_MS = 12_000;
const MAX_BUFFER = 8 * 1024 * 1024;

// A frame this dark is treated as the opening fade rather than content.
const MIN_MEAN_LUMA = 18;

/** Deterministic name, so re-running the backfill overwrites instead of piling up copies. */
export function thumbnailFilenameFor(videoFilename) {
  const base = path.basename(videoFilename).replace(/\.[^.]+$/, "");
  return `${base}.thumb.jpg`;
}

function assertInside(dir, target) {
  const resolvedDir = path.resolve(dir) + path.sep;
  const resolved = path.resolve(target);

  if (!resolved.startsWith(resolvedDir)) {
    throw new Error("Refusing to process a path outside the uploads directory");
  }

  return resolved;
}

/** Returns { durationSeconds, width, height } or throws when this is not a real video. */
export async function probeVideo(videoPath) {
  const { stdout } = await execFileAsync(
    "ffprobe",
    [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=codec_type,width,height",
      "-show_entries", "format=duration",
      "-of", "json",
      videoPath,
    ],
    { timeout: PROBE_TIMEOUT_MS, maxBuffer: MAX_BUFFER },
  );

  const info = JSON.parse(stdout || "{}");
  const stream = (info.streams || [])[0];

  if (!stream || stream.codec_type !== "video") {
    throw new Error("File contains no decodable video stream");
  }

  const duration = Number.parseFloat(info.format?.duration ?? "");

  return {
    durationSeconds: Number.isFinite(duration) && duration > 0 ? duration : 0,
    width: Number(stream.width) || 0,
    height: Number(stream.height) || 0,
  };
}

/**
 * Mean luminance of one frame, read as an 8x8 grayscale buffer straight from
 * ffmpeg. Cheap enough to run over several candidates, and avoids adding an
 * image library just to ask "is this frame black?".
 */
async function meanLumaAt(videoPath, seconds) {
  const { stdout } = await execFileAsync(
    "ffmpeg",
    [
      "-v", "error",
      "-ss", String(seconds),
      "-i", videoPath,
      "-frames:v", "1",
      "-vf", "scale=8:8",
      "-pix_fmt", "gray",
      "-f", "rawvideo",
      "-",
    ],
    { timeout: FRAME_TIMEOUT_MS, maxBuffer: MAX_BUFFER, encoding: "buffer" },
  );

  if (!stdout || stdout.length === 0) return null;

  let total = 0;
  for (const value of stdout) total += value;

  return total / stdout.length;
}

/**
 * Writes a 16:9 JPEG. The frame is scaled to fit and then padded, never
 * stretched — a portrait video keeps its proportions and gets pillarboxed
 * rather than being squashed into a landscape box.
 */
async function writeThumbnail(videoPath, seconds, outputPath) {
  await execFileAsync(
    "ffmpeg",
    [
      "-y",
      "-v", "error",
      "-ss", String(seconds),
      "-i", videoPath,
      "-frames:v", "1",
      "-vf",
      `scale=${THUMB_WIDTH}:${THUMB_HEIGHT}:force_original_aspect_ratio=decrease,` +
        `pad=${THUMB_WIDTH}:${THUMB_HEIGHT}:(ow-iw)/2:(oh-ih)/2:black`,
      "-q:v", "4",
      outputPath,
    ],
    { timeout: FRAME_TIMEOUT_MS, maxBuffer: MAX_BUFFER },
  );

  const stats = await fs.promises.stat(outputPath);

  if (!stats.size) {
    throw new Error("ffmpeg produced an empty thumbnail");
  }

  return stats.size;
}

/**
 * Generates the thumbnail for one stored video.
 *
 * @returns {Promise<{ publicUrl: string, filePath: string, seconds: number, bytes: number }>}
 * @throws when the file is not a usable video or every candidate frame fails.
 */
export async function generateVideoThumbnail({ videoPath, uploadDir, videoFilename }) {
  const safeVideoPath = assertInside(uploadDir, videoPath);
  const outputName = thumbnailFilenameFor(videoFilename);
  const outputPath = assertInside(uploadDir, path.join(uploadDir, outputName));

  const { durationSeconds } = await probeVideo(safeVideoPath);

  // 10-25% in, past the opening frames. A duration-less stream (some webm
  // variants) still gets a sensible fixed ladder.
  const candidates = durationSeconds
    ? [0.1, 0.18, 0.25].map((fraction) =>
        Math.max(0.3, Math.min(durationSeconds - 0.1, durationSeconds * fraction)),
      )
    : [1, 3, 5];

  let best = { seconds: candidates[0], luma: -1 };

  for (const seconds of candidates) {
    let luma = null;

    try {
      luma = await meanLumaAt(safeVideoPath, seconds);
    } catch {
      continue;
    }

    if (luma === null) continue;

    if (luma > best.luma) best = { seconds, luma };

    // Good enough: stop as soon as a candidate is clearly not a black frame.
    if (luma >= MIN_MEAN_LUMA) break;
  }

  const bytes = await writeThumbnail(safeVideoPath, best.seconds, outputPath);

  return {
    publicUrl: `/uploads/${outputName}`,
    filePath: outputPath,
    seconds: best.seconds,
    bytes,
  };
}

/** Best-effort removal; a missing file is not an error. */
export async function removeThumbnailFile(uploadDir, thumbnailUrl) {
  if (!thumbnailUrl) return false;

  const name = path.basename(String(thumbnailUrl));

  if (!name || name === "." || name === "..") return false;

  try {
    const target = assertInside(uploadDir, path.join(uploadDir, name));
    await fs.promises.unlink(target);
    return true;
  } catch {
    return false;
  }
}
