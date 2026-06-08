/**
 * ToastContext — unit tests
 *
 * Renders a consumer component inside ToastProvider and verifies the
 * push (useToast) function adds toasts and they auto-dismiss.
 *
 * Framer Motion is mocked to a passthrough div so jsdom doesn't need
 * a real animation runtime.
 */

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => children,
  motion: {
    div: ({ children, className, style }) => (
      <div className={className} style={style}>
        {children}
      </div>
    ),
  },
}));

// Icon renders an SVG — mock to a simple span for assertion convenience
vi.mock('../components/application/Icon', () => ({
  default: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

// Consumer that exposes push via a button click
function ToastTrigger({ message, kind }) {
  const push = useToast();
  return (
    <button type="button" onClick={() => push(message, kind)}>
      Trigger
    </button>
  );
}

function renderWithProvider(message = 'Test pesan', kind = 'success') {
  return render(
    <ToastProvider>
      <ToastTrigger message={message} kind={kind} />
    </ToastProvider>
  );
}

describe('ToastProvider / useToast', () => {
  it('renders children without any toasts initially', () => {
    renderWithProvider();
    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
    expect(screen.queryByText('Test pesan')).not.toBeInTheDocument();
  });

  it('shows a toast message after push() is called', () => {
    renderWithProvider('Berhasil menyimpan');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    });
    expect(screen.getByText('Berhasil menyimpan')).toBeInTheDocument();
  });

  it('auto-dismisses the toast after 3000ms', () => {
    vi.useFakeTimers();
    renderWithProvider('Sementara tampil');

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    });
    expect(screen.getByText('Sementara tampil')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('Sementara tampil')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('applies "error" class to error toasts', () => {
    renderWithProvider('Terjadi kesalahan', 'error');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    });
    const toastEl = screen.getByText('Terjadi kesalahan').closest('.app-toast');
    expect(toastEl).toHaveClass('error');
  });

  it('applies "warn" class to warn toasts', () => {
    renderWithProvider('Peringatan!', 'warn');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    });
    const toastEl = screen.getByText('Peringatan!').closest('.app-toast');
    expect(toastEl).toHaveClass('warn');
  });

  it('does not apply error or warn class to success toasts', () => {
    renderWithProvider('Sukses!', 'success');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    });
    const toastEl = screen.getByText('Sukses!').closest('.app-toast');
    expect(toastEl).not.toHaveClass('error');
    expect(toastEl).not.toHaveClass('warn');
  });

  it('stacks multiple toasts', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Pertama" kind="success" />
        <ToastTrigger message="Kedua" kind="error" />
      </ToastProvider>
    );

    const [btn1, btn2] = screen.getAllByRole('button', { name: 'Trigger' });
    act(() => {
      fireEvent.click(btn1);
      fireEvent.click(btn2);
    });

    expect(screen.getByText('Pertama')).toBeInTheDocument();
    expect(screen.getByText('Kedua')).toBeInTheDocument();
  });

  it('renders the correct icon for error toasts', () => {
    renderWithProvider('Error!', 'error');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    });
    expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
  });

  it('renders check icon for success toasts', () => {
    renderWithProvider('OK', 'success');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    });
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
  });

  it('renders clock icon for warn toasts', () => {
    renderWithProvider('Peringatan', 'warn');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    });
    expect(screen.getByTestId('icon-clock')).toBeInTheDocument();
  });
});
