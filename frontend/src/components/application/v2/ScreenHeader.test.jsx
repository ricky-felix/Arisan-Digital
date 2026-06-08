/**
 * ScreenHeader — unit tests
 *
 * Covers: title rendering, optional sub-title, back button presence/absence,
 * onBack callback, children slot, and accessibility label on the back button.
 */

// ChevronLeft is a thin SVG wrapper — render it as-is (no mock needed for these tests)

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScreenHeader from './ScreenHeader';

describe('ScreenHeader', () => {
  it('renders the title as a heading', () => {
    render(<ScreenHeader title="Buat Arisan" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Buat Arisan' })).toBeInTheDocument();
  });

  it('renders the sub-title when provided', () => {
    render(<ScreenHeader title="Anggota" sub="12 anggota" />);
    expect(screen.getByText('12 anggota')).toBeInTheDocument();
  });

  it('does not render sub-title paragraph when sub is omitted', () => {
    render(<ScreenHeader title="Profil" />);
    // The paragraph containing sub should not exist
    expect(screen.queryByText(/anggota/)).not.toBeInTheDocument();
  });

  it('renders the back button when onBack is provided', () => {
    render(<ScreenHeader title="Detail Grup" onBack={() => {}} />);
    expect(screen.getByRole('button', { name: 'Kembali' })).toBeInTheDocument();
  });

  it('does not render a back button when onBack is omitted', () => {
    render(<ScreenHeader title="Beranda" />);
    expect(screen.queryByRole('button', { name: 'Kembali' })).not.toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();

    render(<ScreenHeader title="Kembali Test" onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: 'Kembali' }));

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders children in the right-side slot', () => {
    render(
      <ScreenHeader title="Edit Profil" onBack={() => {}}>
        <button type="button">Simpan</button>
      </ScreenHeader>
    );
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument();
  });

  it('renders without children (no errors)', () => {
    expect(() => render(<ScreenHeader title="Tanpa Children" />)).not.toThrow();
  });

  it('applies sticky positioning class on the container', () => {
    const { container } = render(<ScreenHeader title="Sticky" />);
    const outerDiv = container.firstChild;
    expect(outerDiv.className).toContain('sticky');
    expect(outerDiv.className).toContain('top-0');
  });

  it('truncates a very long title without throwing', () => {
    const longTitle = 'A'.repeat(200);
    expect(() => render(<ScreenHeader title={longTitle} />)).not.toThrow();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('has aria-label "Kembali" on the back button for screen readers', () => {
    render(<ScreenHeader title="Aksesibilitas" onBack={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Kembali' });
    expect(btn).toHaveAttribute('aria-label', 'Kembali');
  });
});
