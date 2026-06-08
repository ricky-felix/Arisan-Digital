/**
 * Tests for the ApiClient in src/lib/api.js.
 *
 * Strategy:
 *  - vi.mock the supabase module so getSession() can be controlled.
 *  - vi.stubGlobal('fetch') to intercept HTTP requests.
 *  - Verify that each HTTP verb method sends the right method/body/headers.
 *  - Verify error handling: non-ok responses throw, 204 returns null.
 */

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Also mock config so we have a stable base URL
vi.mock('../config', () => ({
  config: {
    apiUrl: 'http://api.test',
  },
}));

import { supabase } from './supabase';
import { api } from './api';

// Helper — build a successful fetch Response
function makeResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  // By default, no session (unauthenticated)
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ── Authentication header ─────────────────────────────────────────────────────

describe('ApiClient – authentication', () => {
  it('sends no Authorization header when there is no session', async () => {
    fetch.mockResolvedValue(makeResponse({ ok: true }));

    await api.get('/test');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers).not.toHaveProperty('Authorization');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('sends Bearer token in Authorization header when session exists', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'token-abc-123' } },
    });
    fetch.mockResolvedValue(makeResponse({ data: 'ok' }));

    await api.get('/me');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer token-abc-123');
  });
});

// ── HTTP verb methods ─────────────────────────────────────────────────────────

describe('ApiClient.get', () => {
  it('makes a GET request to the correct URL', async () => {
    fetch.mockResolvedValue(makeResponse({ items: [] }));

    const result = await api.get('/groups');

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('http://api.test/groups');
    expect(options.method).toBe('GET');
    expect(result).toEqual({ items: [] });
  });
});

describe('ApiClient.post', () => {
  it('makes a POST request with JSON body', async () => {
    fetch.mockResolvedValue(makeResponse({ id: '1' }, 201));

    const result = await api.post('/groups', { name: 'Arisan Keluarga' });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('http://api.test/groups');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ name: 'Arisan Keluarga' });
    expect(result).toEqual({ id: '1' });
  });
});

describe('ApiClient.patch', () => {
  it('makes a PATCH request with JSON body', async () => {
    fetch.mockResolvedValue(makeResponse({ updated: true }));

    await api.patch('/groups/42', { name: 'Updated' });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('http://api.test/groups/42');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ name: 'Updated' });
  });
});

describe('ApiClient.put', () => {
  it('makes a PUT request with JSON body', async () => {
    fetch.mockResolvedValue(makeResponse({ replaced: true }));

    await api.put('/users/me/bank-account', { bank: 'BCA', account_number: '123' });

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toMatchObject({ bank: 'BCA' });
  });
});

describe('ApiClient.delete', () => {
  it('makes a DELETE request without body when data is undefined', async () => {
    fetch.mockResolvedValue(makeResponse(null, 204));

    const result = await api.delete('/groups/42');

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('http://api.test/groups/42');
    expect(options.method).toBe('DELETE');
    expect(options.body).toBeUndefined();
    expect(result).toBeNull(); // 204 → null
  });

  it('sends a body when data is provided', async () => {
    fetch.mockResolvedValue(makeResponse({ deleted: true }));

    await api.delete('/endpoint', { reason: 'test' });

    const [, options] = fetch.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ reason: 'test' });
  });
});

// ── Error handling ────────────────────────────────────────────────────────────

describe('ApiClient error handling', () => {
  it('throws when response is not ok (4xx)', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not Found' }),
    });

    await expect(api.get('/missing')).rejects.toThrow('Not Found');
  });

  it('throws with "Request failed" fallback when response body is not parseable JSON', async () => {
    // The ApiClient catch block returns { message: 'Request failed' } when .json() rejects
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    });

    await expect(api.get('/broken')).rejects.toThrow('Request failed');
  });

  it('returns null for 204 No Content responses', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn(),
    });

    const result = await api.get('/no-content');
    expect(result).toBeNull();
  });
});
