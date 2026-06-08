import { parseIdentifier } from './identifier';

describe('parseIdentifier', () => {
  // ── Guard cases ──────────────────────────────────────────────────
  it('returns null for null input', () => {
    expect(parseIdentifier(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(parseIdentifier(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseIdentifier('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(parseIdentifier('   ')).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(parseIdentifier(12345)).toBeNull();
    expect(parseIdentifier({})).toBeNull();
  });

  // ── Email happy paths ────────────────────────────────────────────
  it('parses a standard email address', () => {
    const result = parseIdentifier('user@example.com');
    expect(result).toEqual({ type: 'email', email: 'user@example.com' });
  });

  it('lowercases email addresses', () => {
    const result = parseIdentifier('User@Example.COM');
    expect(result).toEqual({ type: 'email', email: 'user@example.com' });
  });

  it('trims whitespace from email', () => {
    const result = parseIdentifier('  hello@test.id  ');
    expect(result).toEqual({ type: 'email', email: 'hello@test.id' });
  });

  it('accepts subdomains in email', () => {
    const result = parseIdentifier('user@mail.example.co.id');
    expect(result).toEqual({ type: 'email', email: 'user@mail.example.co.id' });
  });

  // ── Email invalid cases ──────────────────────────────────────────
  it('returns null for email without domain', () => {
    expect(parseIdentifier('user@')).toBeNull();
  });

  it('returns null for email without TLD', () => {
    expect(parseIdentifier('user@domain')).toBeNull();
  });

  it('returns null for string with @ but no valid TLD suffix', () => {
    // "@" present but fails regex (no two-char TLD)
    expect(parseIdentifier('bad@x')).toBeNull();
  });

  it('returns null for plain string with no @ and no valid phone prefix', () => {
    expect(parseIdentifier('justtext')).toBeNull();
  });

  // ── Phone happy paths ────────────────────────────────────────────
  it('normalises leading 0 to +62 (local format)', () => {
    const result = parseIdentifier('08123456789');
    expect(result).toEqual({ type: 'phone', phone: '+628123456789' });
  });

  it('normalises "62" prefix to "+62" (without leading +)', () => {
    const result = parseIdentifier('628123456789');
    expect(result).toEqual({ type: 'phone', phone: '+628123456789' });
  });

  it('keeps existing + prefix as-is', () => {
    const result = parseIdentifier('+628123456789');
    expect(result).toEqual({ type: 'phone', phone: '+628123456789' });
  });

  it('strips formatting characters (spaces, dashes, dots)', () => {
    const result = parseIdentifier('0812-3456-789');
    expect(result).toEqual({ type: 'phone', phone: '+6281234567890'.slice(0, -1) });
    // Re-check: 0812-3456-789 → digits 081234567890 (11 digits) → +6281234567890
    // Actually stripped = 081234567890 → starts with 0 → +62 + 81234567890 = +6281234567890
    // Wait, "0812-3456-789" → digits only = "08123456789" (11 chars) → +628123456789
  });

  it('strips parentheses and spaces', () => {
    const result = parseIdentifier('(0812) 345 6789');
    expect(result).toEqual({ type: 'phone', phone: '+6281234567890'.slice(0, -1) });
  });

  it('strips dots as formatting', () => {
    const result = parseIdentifier('0812.345.6789');
    expect(result).toEqual({ type: 'phone', phone: '+6281234567890'.slice(0, -1) });
  });

  it('trims leading/trailing spaces before processing phone', () => {
    const result = parseIdentifier('  0812345678  ');
    expect(result).toEqual({ type: 'phone', phone: '+62812345678' });
  });

  // ── Phone invalid cases ──────────────────────────────────────────
  it('returns null for phone with no recognised prefix', () => {
    // Starts with "1" — not 0, 62, or +
    expect(parseIdentifier('1234567890')).toBeNull();
  });

  it('returns null for phone that is too short', () => {
    // +62 + 123 = 5 digits after +, below PHONE_MIN_DIGITS of 7
    expect(parseIdentifier('+62123')).toBeNull();
  });

  it('returns null for phone that is too long', () => {
    // >15 digits total
    expect(parseIdentifier('+621234567890123456')).toBeNull();
  });

  it('accepts a short but valid phone (7 total digits after +)', () => {
    // +62 + 5 digits = 7 total digits — just at the min
    const result = parseIdentifier('+6212345');
    expect(result).toEqual({ type: 'phone', phone: '+6212345' });
  });

  it('accepts maximum length phone (15 total digits)', () => {
    const result = parseIdentifier('+621234567890123');
    expect(result).toEqual({ type: 'phone', phone: '+621234567890123' });
  });
});
