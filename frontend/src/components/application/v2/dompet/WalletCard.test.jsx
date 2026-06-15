/**
 * WalletCard — unit tests
 *
 * Collapsible accordion card shell used for each wallet module.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WalletCard from './WalletCard';

const baseProps = {
  variant: 'arisan',
  icon: <span data-testid="wallet-icon" />,
  label: 'Arisan',
  name: '3 Grup Aktif',
  desc: 'Total iuran Rp 1.500.000/bln',
  stats: [
    { label: 'Grup Aktif', val: '3', sub: 'grup bergabung' },
    { label: 'Arisan Berikutnya', val: 'Rp 500.000', sub: 'Arisan RT 05' },
  ],
  due: { text: 'Jatuh tempo 15 Jul · Arisan RT 05', amount: 'Rp 500.000' },
  open: false,
  onToggle: vi.fn(),
  children: <div data-testid="panel-content">Panel Content</div>,
};

describe('WalletCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the label', () => {
    render(<WalletCard {...baseProps} />);
    expect(screen.getByText('Arisan')).toBeInTheDocument();
  });

  it('renders the name', () => {
    render(<WalletCard {...baseProps} />);
    expect(screen.getByText('3 Grup Aktif')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<WalletCard {...baseProps} />);
    expect(screen.getByText('Total iuran Rp 1.500.000/bln')).toBeInTheDocument();
  });

  it('renders all stat values', () => {
    render(<WalletCard {...baseProps} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    // Rp 500.000 appears in both stats and due-strip — use getAllByText
    const amounts = screen.getAllByText('Rp 500.000');
    expect(amounts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the due text and amount', () => {
    render(<WalletCard {...baseProps} />);
    expect(screen.getByText('Jatuh tempo 15 Jul · Arisan RT 05')).toBeInTheDocument();
    const amounts = screen.getAllByText('Rp 500.000');
    expect(amounts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the icon', () => {
    render(<WalletCard {...baseProps} />);
    expect(screen.getByTestId('wallet-icon')).toBeInTheDocument();
  });

  it('does NOT have "open" class when open=false', () => {
    const { container } = render(<WalletCard {...baseProps} open={false} />);
    expect(container.firstChild.className).not.toContain('open');
  });

  it('has "open" class when open=true', () => {
    const { container } = render(<WalletCard {...baseProps} open={true} />);
    expect(container.firstChild.className).toContain('open');
  });

  it('sets aria-expanded=false when closed', () => {
    render(<WalletCard {...baseProps} open={false} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets aria-expanded=true when open', () => {
    render(<WalletCard {...baseProps} open={true} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onToggle when the card header is clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<WalletCard {...baseProps} onToggle={onToggle} />);
    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('calls onToggle when Enter key is pressed on the card', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<WalletCard {...baseProps} onToggle={onToggle} />);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalled();
  });

  it('renders children inside the panel', () => {
    render(<WalletCard {...baseProps} />);
    expect(screen.getByTestId('panel-content')).toBeInTheDocument();
  });

  it('applies the variant class to the module card', () => {
    const { container } = render(<WalletCard {...baseProps} />);
    const moduleCard = container.querySelector('.module-card');
    expect(moduleCard.className).toContain('arisan');
  });
});
