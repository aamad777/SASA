/* SASA_ADMIN_V24 — image validation and processing.
 *
 * Same safety rules as thumbnails.js: execFile with an argument array so a
 * filename is never parsed as a command, resolved paths asserted inside the
 * intended directory, and a hard timeout plus bounded output on every call.
 *
 * Validation deliberately reads the file's own magic bytes rather than
 * trusting the extension or the client-supplied Content-Type, both of which an
 * uploader controls. SVG is rejected outright: it is a document format that
 * can carry script, and nothing here needs it.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";

const execFileAsync = promisify(execFile);

const TIMEOUT_MS = 30_000;
const MAX_BUFFER = 8 * 1024 * 1024;

export const AVATAR_SIZE = 512;
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const MAX_PUBLIC_IMAGE_BYTES = 25 * 1024 * 1024;

/** Magic-byte signatures for the only image formats accepted anywhere. */
const SIGNATURES = [
  { type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: "image/png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    type: "image/webp",
    test: (b) =>
      b.slice(0, 4).toString("latin1") === "RIFF" && b.slice(8, 12).toString("latin1") === "WEBP",
  },
];

/**
 * Reads the first bytes of the file and returns the real image type, or null.
 * A `.jpg` containing SVG, HTML or a script fails here.
 */
export async function detectImageType(filePath) {
  const handle = await fs.promises.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await handle.read(buffer, 0, 16, 0);

    if (bytesRead < 12) return null;

    const match = SIGNATURES.find((signature) => signature.test(buffer));

    return match ? match.type : null;
  } finally {
    await handle.close();
  }
}

function assertInside(dir, target) {
  const resolvedDir = path.resolve(dir) + path.sep;
  const resolved = path.resolve(target);

  if (!resolved.startsWith(resolvedDir)) {
    throw new Error("Refusing to process a path outside its storage directory");
  }

  return resolved;
}

/**
 * Square avatar: centre-cropped, re-encoded to WebP, all metadata dropped.
 *
 * `-map_metadata -1` is what removes EXIF, and with it any GPS coordinates the
 * phone wrote into the photo. ffmpeg applies the EXIF orientation while
 * decoding, so the saved image is upright and the (now discarded) rotation tag
 * cannot flip it again. An optional crop rectangle from the client is applied
 * first and is clamped to the real frame, so a bad rectangle cannot read
 * outside the image.
 */
export async function makeAvatar({ sourcePath, outputDir, outputName, crop }) {
  const source = assertInside(outputDir, sourcePath);
  const output = assertInside(outputDir, path.join(outputDir, outputName));

  const filters = [];

  if (crop && Number.isFinite(crop.width) && crop.width > 0) {
    const w = Math.max(1, Math.round(crop.width));
    const h = Math.max(1, Math.round(crop.height || crop.width));
    const x = Math.max(0, Math.round(crop.x || 0));
    const y = Math.max(0, Math.round(crop.y || 0));

    // min() against the real dimensions keeps the rectangle inside the frame
    // whatever the client sent.
    filters.push(`crop=min(${w}\\,iw):min(${h}\\,ih):min(${x}\\,iw-1):min(${y}\\,ih-1)`);
  }

  filters.push(
    `scale=${AVATAR_SIZE}:${AVATAR_SIZE}:force_original_aspect_ratio=increase`,
    `crop=${AVATAR_SIZE}:${AVATAR_SIZE}`,
  );

  await execFileAsync(
    "ffmpeg",
    [
      "-y",
      "-v", "error",
      "-i", source,
      "-vf", filters.join(","),
      "-map_metadata", "-1",
      "-frames:v", "1",
      "-c:v", "libwebp",
      "-quality", "82",
      output,
    ],
    { timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER },
  );

  const stats = await fs.promises.stat(output);

  if (!stats.size) throw new Error("Avatar processing produced an empty file");

  return { filePath: output, bytes: stats.size };
}

/**
 * Display copy of a public photo: bounded to 1600px on the long edge and
 * stripped of metadata, so a 12MP phone original is never served to a phone.
 */
export async function makeDisplayImage({ sourcePath, outputDir, outputName, maxEdge = 1600 }) {
  const source = assertInside(outputDir, sourcePath);
  const output = assertInside(outputDir, path.join(outputDir, outputName));

  await execFileAsync(
    "ffmpeg",
    [
      "-y",
      "-v", "error",
      "-i", source,
      "-vf",
      `scale='min(${maxEdge},iw)':'min(${maxEdge},ih)':force_original_aspect_ratio=decrease`,
      "-map_metadata", "-1",
      "-frames:v", "1",
      "-c:v", "libwebp",
      "-quality", "85",
      output,
    ],
    { timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER },
  );

  const stats = await fs.promises.stat(output);

  if (!stats.size) throw new Error("Image processing produced an empty file");

  return { filePath: output, bytes: stats.size };
}

/** True when the processed file carries no EXIF/GPS block at all. */
export async function hasNoMetadata(filePath) {
  const { stdout } = await execFileAsync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format_tags:stream_tags", "-of", "json", filePath],
    { timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER },
  );

  const parsed = JSON.parse(stdout || "{}");
  const formatTags = parsed.format?.tags || {};
  const streamTags = (parsed.streams || []).flatMap((s) => Object.keys(s.tags || {}));

  const interesting = [...Object.keys(formatTags), ...streamTags].filter((key) =>
    /gps|location|make|model|datetime|software|orientation/i.test(key),
  );

  return interesting.length === 0;
}
