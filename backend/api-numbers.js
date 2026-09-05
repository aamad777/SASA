/* SASA_API_NUMERICS_V29 — numeric normalisation at the API boundary.
 *
 * Postgres BIGINT is wider than a JavaScript number, so node-postgres hands
 * bigint columns back as strings rather than silently losing precision. That
 * default is correct and stays: changing the global parser would convert every
 * bigint in the application, including ones that genuinely can exceed
 * Number.MAX_SAFE_INTEGER, and would do it invisibly.
 *
 * Byte counts are a different case. Every one of them is bounded by the 500MB
 * upload limit — thirteen orders of magnitude below the safe-integer ceiling —
 * so they are representable exactly as JSON numbers. Leaving them as strings
 * pushes the problem to every caller: `size_bytes > limit` compares
 * lexicographically, `a + b` concatenates, and a typed client that declares
 * `number` is simply lying.
 *
 * So the conversion happens here, at the boundary, on the specific fields that
 * are known to be bounded, after the range is actually checked. The database
 * keeps exact BIGINT semantics; JSON gets real numbers.
 */

/** The application's hard upload ceiling; every byte count is under it. */
export const MAX_BYTE_FIELD = 500 * 1024 * 1024;

/**
 * Converts a bounded byte count to a JSON number.
 *
 * Parsing goes through BigInt rather than Number so a value too large to be
 * exact is detected instead of being silently rounded — the very failure the
 * string default exists to prevent.
 *
 * Out-of-range is logged rather than thrown: one odd row should not fail an
 * entire media listing, and the value is still returned exactly whenever it is
 * representable. Only a value beyond Number.MAX_SAFE_INTEGER — which would
 * have to be corrupt, being 18 million times the upload limit — is refused,
 * because there is no honest number to return for it.
 */
export function toBoundedByteNumber(value, field = "byte field", max = MAX_BYTE_FIELD) {
  if (value === null || value === undefined) return null;

  let asBigInt;
  try {
    asBigInt = typeof value === "bigint" ? value : BigInt(value);
  } catch {
    console.error(`[api-numbers] ${field} is not an integer: ${String(value).slice(0, 40)}`);
    return null;
  }

  if (asBigInt < 0n) {
    console.error(`[api-numbers] ${field} is negative: ${asBigInt}`);
    return null;
  }

  if (asBigInt > BigInt(Number.MAX_SAFE_INTEGER)) {
    console.error(`[api-numbers] ${field} exceeds safe-integer range: ${asBigInt}`);
    return null;
  }

  if (asBigInt > BigInt(max)) {
    // Still exact as a number, so it is returned; the log records that a value
    // escaped the bound the rest of the system assumes.
    console.warn(`[api-numbers] ${field} above the ${max}-byte bound: ${asBigInt}`);
  }

  return Number(asBigInt);
}

/**
 * Returns a media row safe to serialise. size_bytes is the only bigint the
 * media endpoints expose; everything else is already an int, text or timestamp.
 */
export function normaliseMediaRow(row) {
  if (!row) return row;
  return { ...row, size_bytes: toBoundedByteNumber(row.size_bytes, "media.size_bytes") };
}

export function normaliseMediaRows(rows) {
  return Array.isArray(rows) ? rows.map(normaliseMediaRow) : rows;
}
