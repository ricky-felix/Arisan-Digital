/**
 * FauxQr — unit tests
 *
 * Decorative deterministic QR-style SVG graphic.
 */

import { render, screen } from '@testing-library/react';
import FauxQr from './FauxQr';

describe('FauxQr', () => {
  it('renders an svg element', () => {
    const { container } = render(<FauxQr />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has the accessible role "img" and aria-label', () => {
    render(<FauxQr />);
    expect(screen.getByRole('img', { name: 'Kode QR undangan' })).toBeInTheDocument();
  });

  it('uses the default size of 196', () => {
    const { container } = render(<FauxQr />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '196');
    expect(svg).toHaveAttribute('height', '196');
  });

  it('uses a custom size when provided', () => {
    const { container } = render(<FauxQr size={128} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '128');
    expect(svg).toHaveAttribute('height', '128');
  });

  it('renders rect elements (the QR cells)', () => {
    const { container } = render(<FauxQr />);
    const rects = container.querySelectorAll('rect');
    // A 23×23 grid with ~45% fill gives several hundred cells
    expect(rects.length).toBeGreaterThan(100);
  });

  it('applies the default fillColor to rect elements', () => {
    const { container } = render(<FauxQr />);
    const firstRect = container.querySelector('rect');
    expect(firstRect).toHaveAttribute('fill', 'var(--color-ink-1)');
  });

  it('applies a custom fillColor when provided', () => {
    const { container } = render(<FauxQr fillColor="#312e81" />);
    const firstRect = container.querySelector('rect');
    expect(firstRect).toHaveAttribute('fill', '#312e81');
  });

  it('renders consistently (same number of cells each time — deterministic)', () => {
    const { container: c1 } = render(<FauxQr />);
    const { container: c2 } = render(<FauxQr />);
    expect(c1.querySelectorAll('rect').length).toBe(c2.querySelectorAll('rect').length);
  });
});
