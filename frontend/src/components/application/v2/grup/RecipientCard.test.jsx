/**
 * RecipientCard — unit tests
 *
 * Highlighted callout for the member receiving this round's pot.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipientCard from './RecipientCard';

const mockRecipient = {
  initials: 'BS',
  label: 'Penerima Putaran Ini',
  name: 'Budi Santoso',
  sub: 'Putaran ke-3 · Jatuh tempo 15 Jul',
};

describe('RecipientCard', () => {
  it('renders the initials', () => {
    render(<RecipientCard recipient={mockRecipient} onClick={() => {}} />);
    expect(screen.getByText('BS')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<RecipientCard recipient={mockRecipient} onClick={() => {}} />);
    expect(screen.getByText('Penerima Putaran Ini')).toBeInTheDocument();
  });

  it('renders the recipient name', () => {
    render(<RecipientCard recipient={mockRecipient} onClick={() => {}} />);
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
  });

  it('renders the sub text', () => {
    render(<RecipientCard recipient={mockRecipient} onClick={() => {}} />);
    expect(screen.getByText('Putaran ke-3 · Jatuh tempo 15 Jul')).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<RecipientCard recipient={mockRecipient} onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders as a button element', () => {
    render(<RecipientCard recipient={mockRecipient} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders without crashing when onClick is not provided', () => {
    expect(() =>
      render(<RecipientCard recipient={mockRecipient} />)
    ).not.toThrow();
  });
});
