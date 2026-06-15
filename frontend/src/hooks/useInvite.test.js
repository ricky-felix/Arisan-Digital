/**
 * useInvite.js + useJoinGroup — unit tests
 *
 * Mocks inviteLinksService to avoid real network calls.
 */

vi.mock('../services', () => ({
  inviteLinksService: {
    create: vi.fn(),
    redeem: vi.fn(),
  },
}));

import { renderHook, act } from '@testing-library/react';
import { inviteLinksService } from '../services';
import { useInvite, useJoinGroup } from './useInvite';

beforeEach(() => vi.clearAllMocks());

// ── useInvite ─────────────────────────────────────────────────────────────────

describe('useInvite', () => {
  it('starts with invite=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useInvite('g1'));
    expect(result.current.invite).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns null immediately when groupId is falsy', async () => {
    const { result } = renderHook(() => useInvite(null));
    let returnValue;
    await act(async () => {
      returnValue = await result.current.createInvite();
    });
    expect(returnValue).toBeNull();
    expect(inviteLinksService.create).not.toHaveBeenCalled();
  });

  it('sets loading=true while fetching, then false after', async () => {
    let resolve;
    inviteLinksService.create.mockReturnValue(new Promise(r => { resolve = r; }));

    const { result } = renderHook(() => useInvite('g1'));

    act(() => { result.current.createInvite(); });
    expect(result.current.loading).toBe(true);

    await act(async () => { resolve({ token: 'tok1', expires_at: '2026-12-31', max_uses: 50 }); });
    expect(result.current.loading).toBe(false);
  });

  it('calls inviteLinksService.create with groupId and default options', async () => {
    const mockInvite = { token: 'tok1', expires_at: '2026-12-31', max_uses: 50 };
    inviteLinksService.create.mockResolvedValue(mockInvite);

    const { result } = renderHook(() => useInvite('g1'));
    await act(async () => { await result.current.createInvite(); });

    expect(inviteLinksService.create).toHaveBeenCalledWith('g1', expect.objectContaining({
      max_uses: 50,
    }));
  });

  it('allows overriding max_uses via options', async () => {
    inviteLinksService.create.mockResolvedValue({ token: 'tok2' });
    const { result } = renderHook(() => useInvite('g1'));

    await act(async () => {
      await result.current.createInvite({ max_uses: 10 });
    });

    expect(inviteLinksService.create.mock.calls[0][1].max_uses).toBe(10);
  });

  it('stores the returned invite in state', async () => {
    const mockInvite = { token: 'tok3', expires_at: '2026-12-31', max_uses: 50 };
    inviteLinksService.create.mockResolvedValue(mockInvite);
    const { result } = renderHook(() => useInvite('g1'));

    await act(async () => { await result.current.createInvite(); });

    expect(result.current.invite).toEqual(mockInvite);
  });

  it('sets error and returns null on API failure', async () => {
    inviteLinksService.create.mockRejectedValue(new Error('Forbidden'));
    const { result } = renderHook(() => useInvite('g1'));

    let returnValue;
    await act(async () => {
      returnValue = await result.current.createInvite();
    });

    expect(returnValue).toBeNull();
    expect(result.current.error).toBe('Forbidden');
    expect(result.current.loading).toBe(false);
  });
});

// ── useJoinGroup ──────────────────────────────────────────────────────────────

describe('useJoinGroup', () => {
  it('starts with joinedGroup=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useJoinGroup());
    expect(result.current.joinedGroup).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('validate()', () => {
    it('returns null for an empty string', () => {
      const { result } = renderHook(() => useJoinGroup());
      expect(result.current.validate('')).toBeNull();
    });

    it('returns null for a whitespace-only string', () => {
      const { result } = renderHook(() => useJoinGroup());
      expect(result.current.validate('   ')).toBeNull();
    });

    it('returns { token } for a bare token string', () => {
      const { result } = renderHook(() => useJoinGroup());
      expect(result.current.validate('abc123')).toEqual({ token: 'abc123' });
    });

    it('extracts the token from a URL', () => {
      const { result } = renderHook(() => useJoinGroup());
      const res = result.current.validate('https://app.example.com/invite/abc123');
      expect(res).toEqual({ token: 'abc123' });
    });

    it('returns null for undefined input', () => {
      const { result } = renderHook(() => useJoinGroup());
      expect(result.current.validate(undefined)).toBeNull();
    });
  });

  describe('redeem()', () => {
    it('returns null for empty / whitespace token', async () => {
      const { result } = renderHook(() => useJoinGroup());
      let returnValue;
      await act(async () => {
        returnValue = await result.current.redeem('  ');
      });
      expect(returnValue).toBeNull();
      expect(inviteLinksService.redeem).not.toHaveBeenCalled();
    });

    it('calls inviteLinksService.redeem with trimmed token', async () => {
      inviteLinksService.redeem.mockResolvedValue({ group: { id: 'g1' } });
      const { result } = renderHook(() => useJoinGroup());

      await act(async () => { await result.current.redeem('  tok1  '); });

      expect(inviteLinksService.redeem).toHaveBeenCalledWith('tok1');
    });

    it('stores the joined group in state on success', async () => {
      const mockResult = { group: { id: 'g1', name: 'Arisan RT 05' } };
      inviteLinksService.redeem.mockResolvedValue(mockResult);
      const { result } = renderHook(() => useJoinGroup());

      await act(async () => { await result.current.redeem('tok1'); });

      expect(result.current.joinedGroup).toEqual(mockResult);
    });

    it('sets error and returns null on failure', async () => {
      inviteLinksService.redeem.mockRejectedValue(new Error('Token expired'));
      const { result } = renderHook(() => useJoinGroup());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.redeem('tok-expired');
      });

      expect(returnValue).toBeNull();
      expect(result.current.error).toBe('Token expired');
      expect(result.current.loading).toBe(false);
    });

    it('join() is an alias for redeem()', async () => {
      const mockResult = { group: { id: 'g2' } };
      inviteLinksService.redeem.mockResolvedValue(mockResult);
      const { result } = renderHook(() => useJoinGroup());

      await act(async () => { await result.current.join('tok2'); });

      expect(inviteLinksService.redeem).toHaveBeenCalledWith('tok2');
      expect(result.current.joinedGroup).toEqual(mockResult);
    });
  });
});
