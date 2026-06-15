/**
 * useCreateBill.js — unit tests
 *
 * Verifies the loading/success/error state machine and the payload shape sent
 * to billsService.create().
 */

vi.mock('../services', () => ({
  billsService: { create: vi.fn() },
}));

import { renderHook, act } from '@testing-library/react';
import { billsService } from '../services';
import { useCreateBill } from './useCreateBill';

beforeEach(() => vi.clearAllMocks());

describe('useCreateBill', () => {
  const validForm = {
    title: 'Makan Siang Tim',
    category: 'makanan',
    total: 200000,
  };

  it('starts with saving=false and no error', () => {
    const { result } = renderHook(() => useCreateBill());
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets saving=true during the API call', async () => {
    let resolve;
    billsService.create.mockReturnValue(new Promise(r => { resolve = r; }));

    const { result } = renderHook(() => useCreateBill());

    act(() => { result.current.createBill(validForm); });
    expect(result.current.saving).toBe(true);

    await act(async () => { resolve({ id: 'b1' }); });
    expect(result.current.saving).toBe(false);
  });

  it('calls billsService.create with the correct payload', async () => {
    billsService.create.mockResolvedValue({ id: 'b1' });
    const { result } = renderHook(() => useCreateBill());

    await act(async () => {
      await result.current.createBill(validForm);
    });

    expect(billsService.create).toHaveBeenCalledWith({
      title: 'Makan Siang Tim',
      total_amount: 200000,
      description: 'makanan',
      split_method: 'equal',
    });
  });

  it('trims whitespace from title', async () => {
    billsService.create.mockResolvedValue({ id: 'b2' });
    const { result } = renderHook(() => useCreateBill());

    await act(async () => {
      await result.current.createBill({ ...validForm, title: '  Patungan Kopi  ' });
    });

    expect(billsService.create.mock.calls[0][0].title).toBe('Patungan Kopi');
  });

  it('rounds the total amount with Math.round', async () => {
    billsService.create.mockResolvedValue({ id: 'b3' });
    const { result } = renderHook(() => useCreateBill());

    await act(async () => {
      await result.current.createBill({ ...validForm, total: 200000.6 });
    });

    expect(billsService.create.mock.calls[0][0].total_amount).toBe(200001);
  });

  it('returns the created bill on success', async () => {
    const mockBill = { id: 'b4', title: 'Makan Siang Tim' };
    billsService.create.mockResolvedValue(mockBill);
    const { result } = renderHook(() => useCreateBill());

    let returnValue;
    await act(async () => {
      returnValue = await result.current.createBill(validForm);
    });

    expect(returnValue).toEqual(mockBill);
    expect(result.current.error).toBeNull();
  });

  it('sets error and returns null on API failure', async () => {
    billsService.create.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useCreateBill());

    let returnValue;
    await act(async () => {
      returnValue = await result.current.createBill(validForm);
    });

    expect(returnValue).toBeNull();
    expect(result.current.error).toBe('Network error');
    expect(result.current.saving).toBe(false);
  });

  it('uses empty string as description when category is not provided', async () => {
    billsService.create.mockResolvedValue({ id: 'b5' });
    const { result } = renderHook(() => useCreateBill());

    await act(async () => {
      await result.current.createBill({ title: 'Test', total: 100000 });
    });

    expect(billsService.create.mock.calls[0][0].description).toBe('');
  });
});
