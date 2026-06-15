/**
 * SegFilter — unit tests
 *
 * Segmented filter for the home deck; has both a desktop grouped pill
 * and a mobile collapsible dropdown.
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SegFilter from './SegFilter';

describe('SegFilter', () => {
  // ── Desktop segmented pill ──────────────────────────────────────────────────

  it('renders all filter options in the desktop pill', () => {
    render(<SegFilter value="semua" onChange={() => {}} />);
    expect(screen.getAllByText('Semua').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Arisan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Patungan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Jatuh Tempo').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Selesai').length).toBeGreaterThanOrEqual(1);
  });

  it('marks the active desktop filter button with "active" class', () => {
    render(<SegFilter value="arisan" onChange={() => {}} />);
    // The desktop seg-btn buttons
    const arisanBtns = screen.getAllByRole('button', { name: 'Arisan' });
    // At least one should be active
    const activeBtn = arisanBtns.find(btn => btn.className.includes('active'));
    expect(activeBtn).toBeTruthy();
  });

  it('calls onChange with the correct value when a desktop filter is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SegFilter value="semua" onChange={onChange} />);

    // The first "Patungan" button in the desktop pill
    const buttons = screen.getAllByRole('button', { name: 'Patungan' });
    await user.click(buttons[0]);
    expect(onChange).toHaveBeenCalledWith('patungan');
  });

  // ── Mobile dropdown ─────────────────────────────────────────────────────────
  // The mobile trigger has aria-haspopup="listbox", distinguishing it from desktop pills

  it('renders the mobile trigger button (aria-haspopup=listbox)', () => {
    render(<SegFilter value="semua" onChange={() => {}} />);
    const triggers = screen.getAllByRole('button', { name: /Semua/ });
    const mobileTrigger = triggers.find(t => t.getAttribute('aria-haspopup') === 'listbox');
    expect(mobileTrigger).toBeTruthy();
  });

  it('mobile dropdown is closed by default (no listbox)', () => {
    render(<SegFilter value="semua" onChange={() => {}} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens the mobile dropdown when the mobile trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<SegFilter value="semua" onChange={() => {}} />);
    const triggers = screen.getAllByRole('button', { name: /Semua/ });
    const mobileTrigger = triggers.find(t => t.getAttribute('aria-haspopup') === 'listbox');
    await user.click(mobileTrigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('calls onChange and closes dropdown when a mobile option is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SegFilter value="semua" onChange={onChange} />);

    // Open dropdown via mobile trigger
    const triggers = screen.getAllByRole('button', { name: /Semua/ });
    const mobileTrigger = triggers.find(t => t.getAttribute('aria-haspopup') === 'listbox');
    await user.click(mobileTrigger);

    // Click "Selesai" in the dropdown
    const listbox = screen.getByRole('listbox');
    const selesaiOption = within(listbox).getByRole('option', { name: /Selesai/ });
    await user.click(selesaiOption);

    expect(onChange).toHaveBeenCalledWith('selesai');
    // Dropdown should close
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks the selected option in the dropdown with aria-selected=true', async () => {
    const user = userEvent.setup();
    render(<SegFilter value="arisan" onChange={() => {}} />);

    const triggers = screen.getAllByRole('button', { name: /Arisan/ });
    const mobileTrigger = triggers.find(t => t.getAttribute('aria-haspopup') === 'listbox');
    await user.click(mobileTrigger);

    const listbox = screen.getByRole('listbox');
    const arisanOption = within(listbox).getByRole('option', { name: 'Arisan' });
    expect(arisanOption).toHaveAttribute('aria-selected', 'true');
  });
});
