/**
 * identifier.js — Parse and normalise a single "email or phone number" input.
 *
 * Rules:
 *   - Email: contains "@" and passes a standard RFC-5322-compatible regex.
 *   - Phone: everything else. Normalised to E.164 for Indonesia (default country).
 *     • Leading spaces / dashes / dots / parentheses stripped.
 *     • Starts with "0"      → replace leading "0" with "+62"
 *     • Starts with "62"     → prepend "+"
 *     • Starts with "+"      → kept as-is
 *     • Anything else        → rejected (returns null)
 *
 * Returns { type: 'email', email } or { type: 'phone', phone } on success.
 * Returns null when the input is obviously invalid (empty, malformed).
 */

// Standard email regex — intentionally permissive to match what Supabase
// accepts, but strict enough to reject plain strings with no "@".
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// After cleaning, a valid Indonesian phone is 7–15 digits after the country code.
// We only validate length, not network prefix, since that changes over time.
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;

/**
 * Strip all formatting characters from a phone input (spaces, dashes, dots,
 * parentheses) but leave the leading "+" in place if present.
 */
function stripPhoneFormatting(raw) {
  // Preserve "+" prefix if present, then strip everything except digits.
  const hasPlus = raw.startsWith("+");
  const digitsOnly = raw.replace(/[^\d]/g, "");
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Normalise a phone string to E.164 for Indonesia.
 * Returns the E.164 string on success, or null on failure.
 */
function normalisePhone(raw) {
  const cleaned = stripPhoneFormatting(raw.trim());

  let e164;
  if (cleaned.startsWith("+")) {
    // Already has a country-code prefix — keep it as-is.
    e164 = cleaned;
  } else if (cleaned.startsWith("62")) {
    // Indonesian format without "+", e.g. "62812..."
    e164 = `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    // Local format, e.g. "0812..." → "+62812..."
    e164 = `+62${cleaned.slice(1)}`;
  } else {
    // No recognised prefix — reject.
    return null;
  }

  // Validate total digit count (excluding the "+").
  const digits = e164.replace(/^\+/, "");
  if (digits.length < PHONE_MIN_DIGITS || digits.length > PHONE_MAX_DIGITS) {
    return null;
  }

  return e164;
}

/**
 * parseIdentifier(input)
 *
 * @param {string} input - Raw value from the "Email atau Nomor HP" field.
 * @returns {{ type: 'email', email: string }
 *          | { type: 'phone', phone: string }
 *          | null } Parsed result, or null for obviously invalid input.
 */
export function parseIdentifier(input) {
  if (!input || typeof input !== "string") return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // If it looks like an email, validate and return.
  if (trimmed.includes("@")) {
    if (!EMAIL_RE.test(trimmed)) return null;
    return { type: "email", email: trimmed.toLowerCase() };
  }

  // Otherwise, try to parse as an Indonesian phone number.
  const phone = normalisePhone(trimmed);
  if (!phone) return null;
  return { type: "phone", phone };
}
