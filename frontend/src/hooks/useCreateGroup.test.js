/**
 * useCreateGroup.js — unit tests
 *
 * Verifies the loading/success/error state machine and the payload shape sent
 * to groupsService.create().
 */

vi.mock('../services', () => ({
  groupsService: { create: vi.fn() },
}));

import { renderHook, act } from '@testing-library/react';
import { groupsService } from '../services';
import { useCreateGroup } from './useCreateGroup';

beforeEach(() => vi.clearAllMocks());

describe('useCreateGroup', () => {
  const validForm = {
    name: 'Arisan RT 05',
    description: 'Arisan bulanan warga RT 05',
    category: 'keluarga',
    amount: 500000,
    frequency: 'monthly',
    method: 'manual',
    startDate: '2026-07-01',
  };

  it('starts with saving=false and no error', () => {
    const { result } = renderHook(() => useCreateGroup());
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets saving=true during the API call', async () => {
    let resolve;
    groupsService.create.mockReturnValue(new Promise(r => { resolve = r; }));

    const { result } = renderHook(() => useCreateGroup());

    act(() => { result.current.createGroup(validForm); });
    expect(result.current.saving).toBe(true);

    await act(async () => { resolve({ id: 'g1' }); });
    expect(result.current.saving).toBe(false);
  });

  it('calls groupsService.create with the correct payload', async () => {
    groupsService.create.mockResolvedValue({ id: 'g1' });
    const { result } = renderHook(() => useCreateGroup());

    await act(async () => {
      await result.current.createGroup(validForm);
    });

    expect(groupsService.create).toHaveBeenCalledWith({
      name: 'Arisan RT 05',
      description: 'Arisan bulanan warga RT 05',
      category: 'keluarga',
      contribution_amount: 500000,
      frequency: 'monthly',
      giliran_method: 'manual',
      start_date: '2026-07-01',
    });
  });

  it('trims whitespace from name and description', async () => {
    groupsService.create.mockResolvedValue({ id: 'g2' });
    const { result } = renderHook(() => useCreateGroup());

    await act(async () => {
      await result.current.createGroup({ ...validForm, name: '  Arisan  ', description: '  desc  ' });
    });

    const payload = groupsService.create.mock.calls[0][0];
    expect(payload.name).toBe('Arisan');
    expect(payload.description).toBe('desc');
  });

  it('rounds the amount using Math.round', async () => {
    groupsService.create.mockResolvedValue({ id: 'g3' });
    const { result } = renderHook(() => useCreateGroup());

    await act(async () => {
      await result.current.createGroup({ ...validForm, amount: 500000.7 });
    });

    expect(groupsService.create.mock.calls[0][0].contribution_amount).toBe(500001);
  });

  it('returns the created group on success', async () => {
    const mockGroup = { id: 'g4', name: 'Arisan RT 05' };
    groupsService.create.mockResolvedValue(mockGroup);
    const { result } = renderHook(() => useCreateGroup());

    let returnValue;
    await act(async () => {
      returnValue = await result.current.createGroup(validForm);
    });

    expect(returnValue).toEqual(mockGroup);
    expect(result.current.error).toBeNull();
  });

  it('sets error and returns null on API failure', async () => {
    groupsService.create.mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useCreateGroup());

    let returnValue;
    await act(async () => {
      returnValue = await result.current.createGroup(validForm);
    });

    expect(returnValue).toBeNull();
    expect(result.current.error).toBe('Server error');
    expect(result.current.saving).toBe(false);
  });

  it('defaults description to empty string when not provided', async () => {
    groupsService.create.mockResolvedValue({ id: 'g5' });
    const { result } = renderHook(() => useCreateGroup());
    const formWithoutDesc = { ...validForm };
    delete formWithoutDesc.description;

    await act(async () => {
      await result.current.createGroup(formWithoutDesc);
    });

    expect(groupsService.create.mock.calls[0][0].description).toBe('');
  });
});
