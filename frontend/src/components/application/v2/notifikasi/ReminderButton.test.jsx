/**
 * ReminderButton — unit tests
 *
 * A toggleable button that shows an idle state and a sent/confirmed state.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReminderButton from './ReminderButton';

describe('ReminderButton', () => {
  // ── Idle state ──────────────────────────────────────────────────────────────

  it('renders the idle button with idleLabel text', () => {
    render(
      <ReminderButton sent={false} onClick={() => {}} idleLabel="Ingatkan" sentLabel="Terkirim" />
    );
    expect(screen.getByRole('button', { name: 'Ingatkan' })).toBeInTheDocument();
  });

  it('calls onClick when the idle button is clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <ReminderButton sent={false} onClick={onClick} idleLabel="Ingatkan" sentLabel="Terkirim" />
    );
    await user.click(screen.getByRole('button', { name: 'Ingatkan' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies the lavender variant idle class by default (lv)', () => {
    const { container } = render(
      <ReminderButton sent={false} onClick={() => {}} idleLabel="Ingatkan" sentLabel="Terkirim" />
    );
    expect(container.firstChild.className).toContain('lv');
  });

  it('applies the emerald variant idle class when variant="em"', () => {
    const { container } = render(
      <ReminderButton sent={false} onClick={() => {}} idleLabel="Bayar" sentLabel="Lunas" variant="em" />
    );
    expect(container.firstChild.className).toContain('em');
  });

  // ── Sent state ──────────────────────────────────────────────────────────────

  it('renders the sentLabel as a span (not a button) when sent=true', () => {
    render(
      <ReminderButton sent={true} onClick={() => {}} idleLabel="Ingatkan" sentLabel="Terkirim" />
    );
    expect(screen.getByText(/Terkirim/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies the sent-lv class for lv variant in sent state', () => {
    const { container } = render(
      <ReminderButton sent={true} onClick={() => {}} idleLabel="Ingatkan" sentLabel="Terkirim" variant="lv" />
    );
    expect(container.firstChild.className).toContain('sent-lv');
  });

  it('applies the sent class for em variant in sent state', () => {
    const { container } = render(
      <ReminderButton sent={true} onClick={() => {}} idleLabel="Bayar" sentLabel="Lunas" variant="em" />
    );
    expect(container.firstChild.className).toContain('sent');
    expect(container.firstChild.className).not.toContain('sent-lv');
  });
});
