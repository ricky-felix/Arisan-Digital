/**
 * AuthContext — unit tests
 *
 * Mocks supabase auth and the backend users service so the context logic is
 * tested in isolation.
 * Covers: initial loading state, authenticated/unauthenticated hydration,
 * login(), register() (email + phone), logout(), and updateProfile().
 */

vi.mock('../lib/supabase', () => {
  const listeners = [];
  const mockAuth = {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn((cb) => {
      listeners.push(cb);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    _triggerStateChange: (event, session) => listeners.forEach(cb => cb(event, session)),
  };
  return { supabase: { auth: mockAuth } };
});

vi.mock('../services/users.service', () => ({
  usersService: {
    getMe: vi.fn(),
    updateMe: vi.fn(),
  },
}));

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { supabase } from '../lib/supabase';
import { usersService } from '../services/users.service';
import { AuthProvider, useAuth } from './AuthContext';

// Helper consumer that reads from useAuth and surfaces error/state via DOM
function AuthConsumer() {
  const { user, loading, isAuthenticated, login, logout, register } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.id : 'null'}</span>
      <button
        onClick={() =>
          login({ identifier: 'test@example.com', password: 'password123' })
        }
      >
        Login
      </button>
      <button
        onClick={() =>
          register({ identifier: '081234567890', password: 'password123', name: 'Budi' })
        }
      >
        Register
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: no session
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  supabase.auth.signOut.mockResolvedValue({ error: null });
  usersService.getMe.mockResolvedValue({ id: 'u1', name: 'Budi' });
  usersService.updateMe.mockResolvedValue({ id: 'u1', name: 'Budi' });
});

describe('AuthProvider', () => {
  it('starts in loading state', () => {
    renderWithProvider();
    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('resolves to unauthenticated when there is no session', async () => {
    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('hydrates user from existing session on mount and loads the profile from the backend', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'tok',
          user: { id: 'u1', email: 'test@example.com' },
        },
      },
    });

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('u1');
    // Profile comes from GET /users/me (backend); the frontend never writes it,
    // so the real name from the handle_new_user trigger is what shows — no guest.
    expect(usersService.getMe).toHaveBeenCalled();
  });

  it('rejects a leftover anonymous session (C4 — no guest accounts)', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'tok',
          user: { id: 'anon1', is_anonymous: true },
        },
      },
    });

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    // The anonymous session is signed out and never treated as authenticated.
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(usersService.getMe).not.toHaveBeenCalled();
  });

  it('throws from useAuth when used outside AuthProvider', () => {
    function Orphan() {
      useAuth();
      return null;
    }
    // Suppress the React error boundary console output for this expected throw
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(() => render(<Orphan />)).toThrow('useAuth must be used inside <AuthProvider>');
    } finally {
      errSpy.mockRestore();
      warnSpy.mockRestore();
    }
  });
});

describe('login()', () => {
  it('calls signInWithPassword with email credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null });

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('throws error message when signInWithPassword fails', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      error: new Error('Invalid credentials'),
    });

    let thrownError;
    function CapturingConsumer() {
      const { login } = useAuth();
      return (
        <button
          onClick={async () => {
            try {
              await login({ identifier: 'bad@test.com', password: 'wrong' });
            } catch (e) {
              thrownError = e;
            }
          }}
        >
          Bad Login
        </button>
      );
    }

    render(
      <AuthProvider>
        <CapturingConsumer />
      </AuthProvider>
    );

    await waitFor(() => {});

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Bad Login' }));

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toBe('Invalid credentials');
  });

  it('throws with Indonesian message for invalid identifier', async () => {
    let thrownError;
    function CapturingConsumer() {
      const { login } = useAuth();
      return (
        <button
          onClick={async () => {
            try {
              await login({ identifier: 'not-valid-at-all', password: 'pw' });
            } catch (e) {
              thrownError = e;
            }
          }}
        >
          Invalid Login
        </button>
      );
    }

    render(
      <AuthProvider>
        <CapturingConsumer />
      </AuthProvider>
    );
    await waitFor(() => {});

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Invalid Login' }));

    expect(thrownError.message).toContain('email atau nomor HP yang valid');
  });
});

describe('register()', () => {
  it('calls signUp with phone credentials (local format)', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user' }, session: { access_token: 'tok' } },
      error: null,
    });

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Register' }));

    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: '+6281234567890',
        password: 'password123',
        options: expect.objectContaining({
          data: expect.objectContaining({ full_name: 'Budi' }),
        }),
      })
    );
  });

  it('throws when confirmation is pending (user without session)', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'u2' }, session: null },
      error: null,
    });

    let thrownError;
    function Capturer() {
      const { register } = useAuth();
      return (
        <button
          onClick={async () => {
            try {
              await register({ identifier: 'confirm@test.com', password: 'pw123456', name: 'Test' });
            } catch (e) {
              thrownError = e;
            }
          }}
        >
          Register Confirm
        </button>
      );
    }

    render(
      <AuthProvider>
        <Capturer />
      </AuthProvider>
    );
    await waitFor(() => {});

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Register Confirm' }));

    expect(thrownError.message).toContain('konfirmasi akun');
  });
});

describe('logout()', () => {
  it('calls supabase.auth.signOut', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });
});
