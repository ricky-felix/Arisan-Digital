import { formatRupiah } from './formatRupiah';

describe('formatRupiah', () => {
  it('formats a whole number as IDR currency', () => {
    const result = formatRupiah(100000);
    // IDR symbol and number should be present
    expect(result).toMatch(/100\.000/);
    expect(result).toMatch(/Rp/);
  });

  it('formats zero as Rp 0', () => {
    const result = formatRupiah(0);
    expect(result).toMatch(/0/);
    expect(result).toMatch(/Rp/);
  });

  it('formats large amounts with dot thousand separators', () => {
    const result = formatRupiah(1500000);
    expect(result).toMatch(/1\.500\.000/);
  });

  it('formats small amounts', () => {
    const result = formatRupiah(500);
    expect(result).toMatch(/500/);
  });

  it('uses no fractional digits (minimumFractionDigits: 0)', () => {
    // 100000.5 — Intl with minimumFractionDigits:0 may still show ,5 if it
    // rounds to a non-integer, but 100000 should definitely have no decimal
    const result = formatRupiah(100000);
    // Should not have a comma decimal separator
    expect(result).not.toMatch(/,\d{2}$/);
  });

  it('formats negative amounts', () => {
    const result = formatRupiah(-50000);
    expect(result).toMatch(/50\.000/);
  });

  it('formats 1000 correctly', () => {
    const result = formatRupiah(1000);
    expect(result).toMatch(/1\.000/);
  });

  it('returns a string', () => {
    expect(typeof formatRupiah(250000)).toBe('string');
  });
});
