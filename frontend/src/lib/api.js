import { supabase } from './supabase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function request(method, path, body) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `API error ${res.status}`);
  }

  // 204 No Content has no body
  if (res.status === 204) return null;
  return res.json();
}

const get  = (path)        => request('GET',    path);
const post = (path, body)  => request('POST',   path, body);
const patch = (path, body) => request('PATCH',  path, body);
const del  = (path)        => request('DELETE', path);

export const api = {
  get,
  post,
  patch,
  delete: del,

  groups: {
    list:   ()         => get('/groups'),
    get:    (id)       => get(`/groups/${id}`),
    create: (data)     => post('/groups', data),
    delete: (id)       => del(`/groups/${id}`),
  },

  payments: {
    mine:     ()        => get('/payments/me'),
    forGroup: (groupId) => get(`/payments/group/${groupId}`),
    create:   (data)    => post('/payments', data),
    confirm:  (id)      => patch(`/payments/${id}/confirm`),
  },

  users: {
    me:     ()     => get('/users/me'),
    update: (data) => patch('/users/me', data),
  },
};
