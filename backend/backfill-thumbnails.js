#!/usr/bin/env node
/* SASA_VIDEO_THUMBNAILS_V21 — backfill thumbnails for videos uploaded before
 * thumbnail generation existed.
 *
 * Deliberately boring and restartable:
 *   - --count reports how much work there is and changes nothing;
 *   - one video at a time, so a backfill cannot starve the API it shares a
 *     container with;
 *   - only rows whose thumbnail_url is NULL/empty are touched, and a row whose
 *     thumbnail file already exists on disk is adopted rather than re-encoded,
 *     so a rerun neither duplicates files nor redoes work;
 *   - the original video is only ever read;
 *   - every outcome is printed and totalled, and one bad file does not stop
 *     the run.
 *
 * Usage, from inside the backend container:
 *   node backfill-thumbnails.js --count
 *   node backfill-thumbnails.js [--limit N] [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { generateVideoThumbnail, thumbnailFilenameFor } from "./thumbnails.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const PENDING_SQL = `
  SELECT id, title, file_path, public_url
    FROM media_files
   WHERE media_type = 'video'
     AND (thumbnail_url IS NULL OR length(trim(thumbnail_url)) = 0)
   ORDER BY created_at ASC`;

async function main() {
  const pending = (await pool.query(PENDING_SQL)).rows;

  const totalVideos = Number(
    (await pool.query(`SELECT count(*) FROM media_files WHERE media_type = 'video'`)).rows[0].count,
  );

  console.log(`videos total:            ${totalVideos}`);
  console.log(`videos needing thumbnail: ${pending.length}`);

  if (has("--count")) {
    for (const row of pending) console.log(`  - ${row.id}  ${row.title ?? "(untitled)"}`);
    return;
  }

  if (has("--dry-run")) {
    console.log("dry run - nothing will be written");
    return;
  }

  const limit = Number(valueOf("--limit", pending.length)) || pending.length;
  const work = pending.slice(0, limit);

  let done = 0;
  let adopted = 0;
  let failed = 0;

  for (const row of work) {
    const filename = path.basename(String(row.file_path || row.public_url || ""));

    if (!filename) {
      console.log(`  FAIL    ${row.id}  no stored filename`);
      failed += 1;
      continue;
    }

    const videoPath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(videoPath)) {
      console.log(`  FAIL    ${row.id}  source file missing: ${filename}`);
      failed += 1;
      continue;
    }

    // Rerun safety: if the thumbnail file is already on disk, just point the
    // row at it instead of encoding a second copy.
    const existing = path.join(UPLOAD_DIR, thumbnailFilenameFor(filename));

    if (fs.existsSync(existing) && fs.statSync(existing).size > 0) {
      await pool.query(`UPDATE media_files SET thumbnail_url = $2, updated_at = now() WHERE id = $1`, [
        row.id,
        `/uploads/${path.basename(existing)}`,
      ]);
      console.log(`  ADOPTED ${row.id}  ${path.basename(existing)}`);
      adopted += 1;
      continue;
    }

    try {
      const thumb = await generateVideoThumbnail({
        videoPath,
        uploadDir: UPLOAD_DIR,
        videoFilename: filename,
      });

      await pool.query(`UPDATE media_files SET thumbnail_url = $2, updated_at = now() WHERE id = $1`, [
        row.id,
        thumb.publicUrl,
      ]);

      console.log(
        `  OK      ${row.id}  ${path.basename(thumb.filePath)}  ` +
          `@${thumb.seconds.toFixed(1)}s  ${thumb.bytes} bytes`,
      );
      done += 1;
    } catch (error) {
      console.log(`  FAIL    ${row.id}  ${error.message}`);
      failed += 1;
    }
  }

  console.log(`\ngenerated: ${done}  adopted: ${adopted}  failed: ${failed}`);
}

main()
  .catch((error) => {
    console.error("backfill aborted:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
