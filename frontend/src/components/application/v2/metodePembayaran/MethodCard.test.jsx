/**
 * MethodCard — unit tests
 *
 * Displays a saved payment method as a list card with edit/delete/set-primary actions.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MethodCard from './MethodCard';

const ewalletMethod = {
  id: 'pm1',
  type: 'gopay',
  label: 'GoPay Pribadi',
  phone: '081234567890',
  is_primary: false,
};

const primaryMethod = {
  id: 'pm2',
  type: 'ovo',
  label: 'OVO Utama',
  phone: '082345678901',
  is_primary: true,
};

describe('MethodCard', () => {
  it('renders the method label', () => {
    render(<MethodCard method={ewalletMethod} onEdit={() => {}} onDelete={() => {}} onSetPrimary={() => {}} />);
    expect(screen.getByText('GoPay Pribadi')).toBeInTheDocument();
  });

  it('renders the human-readable type label (GoPay)', () => {
    render(<MethodCard method={ewalletMethod} onEdit={() => {}} onDelete={() => {}} onSetPrimary={() => {}} />);
    // TYPE_LABELS['gopay'] = 'GoPay'; it appears in the <p> type detail line
    const allGoPay = screen.getAllByText(/GoPay/);
    expect(allGoPay.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the phone number for e-wallet types', () => {
    render(<MethodCard method={ewalletMethod} onEdit={() => {}} onDelete={() => {}} onSetPrimary={() => {}} />);
    expect(screen.getByText('081234567890')).toBeInTheDocument();
  });

  it('shows "Utama" badge when is_primary=true', () => {
    render(<MethodCard method={primaryMethod} onEdit={() => {}} onDelete={() => {}} onSetPrimary={() => {}} />);
    expect(screen.getByText('Utama')).toBeInTheDocument();
  });

  it('does NOT show "Utama" badge when is_primary=false', () => {
    render(<MethodCard method={ewalletMethod} onEdit={() => {}} onDelete={() => {}} onSetPrimary={() => {}} />);
    expect(screen.queryByText('Utama')).not.toBeInTheDocument();
  });

  it('renders the edit button', () => {
    render(<MethodCard method={ewalletMethod} onEdit={() => {}} onDelete={() => {}} onSetPrimary={() => {}} />);
    expect(screen.getByRole('button', { name: /Edit GoPay Pribadi/i })).toBeInTheDocument();
  });

  it('renders the delete button', () => {
    render(<MethodCard method={ewalletMethod} onEdit={() => {}} onDelete={() => {}} onSetPrimary={() => {}} />);
    expect(screen.getByRole('button', { name: /Hapus GoPay Pribadi/i })).toBeInTheDocument();
  });

  it('calls onEdit with the method when edit button is clicked', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<MethodCard method={ewalletMethod} onEdit={onEdit} onDelete={() => {}} onSetPrimary={() => {}} />);
    await user.click(screen.getByRole('button', { name: /Edit GoPay Pribadi/i }));
    expect(onEdit).toHaveBeenCalledWith(ewalletMethod);
  });

  it('calls onDelete with the method when delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<MethodCard method={ewalletMethod} onEdit={() => {}} onDelete={onDelete} onSetPrimary={() => {}} />);
    await user.click(screen.getByRole('button', { name: /Hapus GoPay Pribadi/i }));
    expect(onDelete).toHaveBeenCalledWith(ewalletMethod);
  });

  it('renders the set-as-primary button when is_primary=false', () => {
    render(<MethodCard method={ewalletMethod} onEdit={() => {}} onDelete={() => {}} onSetPrimary={() => {}} />);
    expect(screen.getByRole('button', { name: /Jadikan GoPay Pribadi metode utama/i })).toBeInTheDocument();
  });

  it('does NOT render set-as-primary button when is_primary=true', () => {
    render(<MethodCard method={primaryMethod} onEdit={() => {}} onDelete={() => {}} onSetPrimary={() => {}} />);
    expect(screen.queryByRole('button', { name: /Jadikan/i })).not.toBeInTheDocument();
  });

  it('calls onSetPrimary with the method when set-as-primary button is clicked', async () => {
    const onSetPrimary = vi.fn();
    const user = userEvent.setup();
    render(<MethodCard method={ewalletMethod} onEdit={() => {}} onDelete={() => {}} onSetPrimary={onSetPrimary} />);
    await user.click(screen.getByRole('button', { name: /Jadikan GoPay Pribadi metode utama/i }));
    expect(onSetPrimary).toHaveBeenCalledWith(ewalletMethod);
  });
});
