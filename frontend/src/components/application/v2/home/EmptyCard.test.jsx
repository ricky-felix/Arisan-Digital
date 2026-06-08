/**
 * EmptyCard — unit tests
 *
 * CardBlobs and icon components are simple SVG renders — no need to mock them.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyCard from './EmptyCard';

describe('EmptyCard', () => {
  it('renders the onboarding headline', () => {
    render(<EmptyCard onCta={() => {}} />);
    expect(screen.getByText(/Kelola uang bareng/i)).toBeInTheDocument();
  });

  it('renders the empty state eyebrow label', () => {
    render(<EmptyCard onCta={() => {}} />);
    expect(screen.getByText(/Belum ada Arisan atau Patungan/i)).toBeInTheDocument();
  });

  it('renders the CTA button with correct text', () => {
    render(<EmptyCard onCta={() => {}} />);
    expect(screen.getByRole('button', { name: /Mulai Sekarang/i })).toBeInTheDocument();
  });

  it('calls onCta when the CTA button is clicked', async () => {
    const onCta = vi.fn();
    const user = userEvent.setup();

    render(<EmptyCard onCta={onCta} />);
    await user.click(screen.getByRole('button', { name: /Mulai Sekarang/i }));

    expect(onCta).toHaveBeenCalledOnce();
  });

  it('renders the "Kosong" badge', () => {
    render(<EmptyCard onCta={() => {}} />);
    expect(screen.getByText('Kosong')).toBeInTheDocument();
  });

  it('renders the descriptive body text', () => {
    render(<EmptyCard onCta={() => {}} />);
    expect(screen.getByText(/ajak teman, keluarga/i)).toBeInTheDocument();
  });

  it('applies the story-card and card-empty CSS classes', () => {
    const { container } = render(<EmptyCard onCta={() => {}} />);
    const card = container.firstChild;
    expect(card.className).toContain('story-card');
    expect(card.className).toContain('card-empty');
  });
});
