/**
 * DeleteConfirmModal — unit tests
 *
 * Center modal confirming deletion of a payment method.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteConfirmModal from './DeleteConfirmModal';

const mockMethod = {
  id: 'pm1',
  type: 'gopay',
  label: 'GoPay Pribadi',
  is_primary: false,
};

describe('DeleteConfirmModal', () => {
  it('renders nothing when method is null', () => {
    const { container } = render(
      <DeleteConfirmModal method={null} onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when method is provided', () => {
    render(
      <DeleteConfirmModal method={mockMethod} onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the modal title', () => {
    render(
      <DeleteConfirmModal method={mockMethod} onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText('Hapus Metode Pembayaran?')).toBeInTheDocument();
  });

  it('renders the method label', () => {
    render(
      <DeleteConfirmModal method={mockMethod} onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText('GoPay Pribadi')).toBeInTheDocument();
  });

  it('renders the warning copy text', () => {
    render(
      <DeleteConfirmModal method={mockMethod} onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText(/Orang lain tidak bisa membayar/)).toBeInTheDocument();
  });

  it('calls onConfirm when the Hapus button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteConfirmModal method={mockMethod} onConfirm={onConfirm} onCancel={() => {}} />
    );
    await user.click(screen.getByRole('button', { name: 'Hapus' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when the Batal button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteConfirmModal method={mockMethod} onConfirm={() => {}} onCancel={onCancel} />
    );
    await user.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when the close (Tutup) button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteConfirmModal method={mockMethod} onConfirm={() => {}} onCancel={onCancel} />
    );
    await user.click(screen.getByRole('button', { name: 'Tutup' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when the backdrop is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteConfirmModal method={mockMethod} onConfirm={() => {}} onCancel={onCancel} />
    );
    // Click the backdrop (the dialog element itself)
    await user.click(screen.getByRole('dialog'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('disables buttons when deleting=true', () => {
    render(
      <DeleteConfirmModal method={mockMethod} onConfirm={() => {}} onCancel={() => {}} deleting={true} />
    );
    expect(screen.getByRole('button', { name: 'Hapus' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Batal' })).toBeDisabled();
  });

  it('shows a spinner when deleting=true', () => {
    const { container } = render(
      <DeleteConfirmModal method={mockMethod} onConfirm={() => {}} onCancel={() => {}} deleting={true} />
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('does not show a spinner when deleting=false', () => {
    const { container } = render(
      <DeleteConfirmModal method={mockMethod} onConfirm={() => {}} onCancel={() => {}} deleting={false} />
    );
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
  });
});
