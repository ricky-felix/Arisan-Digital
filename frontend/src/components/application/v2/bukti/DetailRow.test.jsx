/**
 * DetailRow — unit tests
 *
 * A simple presentational component: label + children + optional border.
 */

import { render, screen } from '@testing-library/react';
import DetailRow from './DetailRow';

describe('DetailRow', () => {
  it('renders the label text', () => {
    render(<DetailRow label="Jumlah">Rp 500.000</DetailRow>);
    expect(screen.getByText('Jumlah')).toBeInTheDocument();
  });

  it('renders children as the value', () => {
    render(<DetailRow label="Status">Lunas</DetailRow>);
    expect(screen.getByText('Lunas')).toBeInTheDocument();
  });

  it('renders JSX children (not just text)', () => {
    render(
      <DetailRow label="Metode">
        <strong>Transfer Bank</strong>
      </DetailRow>
    );
    expect(screen.getByText('Transfer Bank')).toBeInTheDocument();
  });

  it('includes bottom border class by default (last=false)', () => {
    const { container } = render(<DetailRow label="Label">Value</DetailRow>);
    const row = container.firstChild;
    expect(row.className).toContain('border-b');
  });

  it('omits bottom border class when last=true', () => {
    const { container } = render(
      <DetailRow label="Terakhir" last={true}>
        Nilai
      </DetailRow>
    );
    const row = container.firstChild;
    expect(row.className).not.toContain('border-b');
  });

  it('applies valueClass to the value span', () => {
    const { container } = render(
      <DetailRow label="Label" valueClass="text-emerald-600">
        Green Value
      </DetailRow>
    );
    const valueSpan = container.querySelector('span:last-of-type');
    expect(valueSpan.className).toContain('text-emerald-600');
  });

  it('applies valueStyle to the value span', () => {
    render(
      <DetailRow label="Label" valueStyle={{ color: 'rgb(255, 0, 0)' }}>
        Styled
      </DetailRow>
    );
    const valueEl = screen.getByText('Styled');
    expect(valueEl).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('renders without optional props', () => {
    expect(() => render(<DetailRow label="Min">Min value</DetailRow>)).not.toThrow();
  });
});
