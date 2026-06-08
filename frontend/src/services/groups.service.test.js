/**
 * groups.service.js — unit tests
 *
 * Mocks src/lib/api.js so no real HTTP calls are made.
 * Verifies that each service method calls the right api verb + endpoint.
 */

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../lib/api';
import {
  groupsService,
  groupMembersService,
  roundsService,
  inviteLinksService,
} from './groups.service';

beforeEach(() => {
  vi.clearAllMocks();
});

// ── groupsService ─────────────────────────────────────────────────────────────

describe('groupsService', () => {
  it('list() calls GET /groups', async () => {
    api.get.mockResolvedValue([]);
    await groupsService.list();
    expect(api.get).toHaveBeenCalledWith('/groups');
  });

  it('getById() calls GET /groups/:id', async () => {
    api.get.mockResolvedValue({ id: 'g1' });
    await groupsService.getById('g1');
    expect(api.get).toHaveBeenCalledWith('/groups/g1');
  });

  it('create() calls POST /groups with data', async () => {
    const data = { name: 'Arisan Keluarga', contribution_amount: 500000 };
    api.post.mockResolvedValue({ id: 'new-id', ...data });
    await groupsService.create(data);
    expect(api.post).toHaveBeenCalledWith('/groups', data);
  });

  it('update() calls PATCH /groups/:id with data', async () => {
    const data = { name: 'Renamed' };
    api.patch.mockResolvedValue({ id: 'g1', ...data });
    await groupsService.update('g1', data);
    expect(api.patch).toHaveBeenCalledWith('/groups/g1', data);
  });

  it('delete() calls DELETE /groups/:id', async () => {
    api.delete.mockResolvedValue(null);
    await groupsService.delete('g1');
    expect(api.delete).toHaveBeenCalledWith('/groups/g1');
  });

  it('returns the API response', async () => {
    const mockGroup = { id: 'g1', name: 'Test Arisan' };
    api.get.mockResolvedValue(mockGroup);
    const result = await groupsService.getById('g1');
    expect(result).toEqual(mockGroup);
  });
});

// ── groupMembersService ───────────────────────────────────────────────────────

describe('groupMembersService', () => {
  it('list() calls GET /groups/:groupId/members', async () => {
    api.get.mockResolvedValue([]);
    await groupMembersService.list('g1');
    expect(api.get).toHaveBeenCalledWith('/groups/g1/members');
  });

  it('add() calls POST /groups/:groupId/members', async () => {
    const data = { user_id: 'u1', group_role: 'member' };
    api.post.mockResolvedValue({ id: 'm1' });
    await groupMembersService.add('g1', data);
    expect(api.post).toHaveBeenCalledWith('/groups/g1/members', data);
  });

  it('remove() calls DELETE /groups/:groupId/members/:userId', async () => {
    api.delete.mockResolvedValue(null);
    await groupMembersService.remove('g1', 'u1');
    expect(api.delete).toHaveBeenCalledWith('/groups/g1/members/u1');
  });

  it('assignGiliran() calls POST /groups/:groupId/members/assign-giliran', async () => {
    const data = { assignments: [{ user_id: 'u1', giliran_order: 1 }] };
    api.post.mockResolvedValue({ ok: true });
    await groupMembersService.assignGiliran('g1', data);
    expect(api.post).toHaveBeenCalledWith('/groups/g1/members/assign-giliran', data);
  });

  it('randomShuffle() calls POST /groups/:groupId/members/random-shuffle', async () => {
    api.post.mockResolvedValue({ ok: true });
    await groupMembersService.randomShuffle('g1');
    expect(api.post).toHaveBeenCalledWith('/groups/g1/members/random-shuffle');
  });
});

// ── roundsService ─────────────────────────────────────────────────────────────

describe('roundsService', () => {
  it('list() calls GET /groups/:groupId/rounds', async () => {
    api.get.mockResolvedValue([]);
    await roundsService.list('g1');
    expect(api.get).toHaveBeenCalledWith('/groups/g1/rounds');
  });

  it('getById() calls GET /rounds/:roundId', async () => {
    api.get.mockResolvedValue({ id: 'r1' });
    await roundsService.getById('r1');
    expect(api.get).toHaveBeenCalledWith('/rounds/r1');
  });

  it('setRecipient() calls PATCH /rounds/:id/recipient', async () => {
    api.patch.mockResolvedValue({ ok: true });
    await roundsService.setRecipient('r1', { recipient_id: 'u1' });
    expect(api.patch).toHaveBeenCalledWith('/rounds/r1/recipient', { recipient_id: 'u1' });
  });

  it('activate() calls POST /rounds/:id/activate', async () => {
    api.post.mockResolvedValue({ status: 'active' });
    await roundsService.activate('r1');
    expect(api.post).toHaveBeenCalledWith('/rounds/r1/activate');
  });

  it('complete() calls POST /rounds/:id/complete', async () => {
    api.post.mockResolvedValue({ status: 'completed' });
    await roundsService.complete('r1');
    expect(api.post).toHaveBeenCalledWith('/rounds/r1/complete');
  });

  describe('getCurrent()', () => {
    it('returns null when rounds list is empty', async () => {
      api.get.mockResolvedValue([]);
      const result = await roundsService.getCurrent('g1');
      expect(result).toBeNull();
    });

    it('returns null when list() returns a non-array', async () => {
      api.get.mockResolvedValue(null);
      const result = await roundsService.getCurrent('g1');
      expect(result).toBeNull();
    });

    it('returns the active round when one exists', async () => {
      const rounds = [
        { id: 'r1', status: 'completed', round_number: 1 },
        { id: 'r2', status: 'active', round_number: 2 },
        { id: 'r3', status: 'upcoming', round_number: 3 },
      ];
      api.get.mockResolvedValue(rounds);
      const result = await roundsService.getCurrent('g1');
      expect(result).toMatchObject({ id: 'r2', status: 'active' });
    });

    it('falls back to last round when no active round found', async () => {
      const rounds = [
        { id: 'r1', status: 'completed', round_number: 1 },
        { id: 'r2', status: 'upcoming', round_number: 2 },
      ];
      api.get.mockResolvedValue(rounds);
      const result = await roundsService.getCurrent('g1');
      expect(result).toMatchObject({ id: 'r2' });
    });
  });
});

// ── inviteLinksService ────────────────────────────────────────────────────────

describe('inviteLinksService', () => {
  it('create() calls POST /invites with group_id merged into body', async () => {
    api.post.mockResolvedValue({ token: 'tok1' });
    await inviteLinksService.create('g1', { max_uses: 5 });
    expect(api.post).toHaveBeenCalledWith('/invites', { group_id: 'g1', max_uses: 5 });
  });

  it('listForGroup() calls GET /invites/group/:groupId', async () => {
    api.get.mockResolvedValue([]);
    await inviteLinksService.listForGroup('g1');
    expect(api.get).toHaveBeenCalledWith('/invites/group/g1');
  });

  it('revoke() calls PATCH /invites/:id/revoke', async () => {
    api.patch.mockResolvedValue({ active: false });
    await inviteLinksService.revoke('inv1');
    expect(api.patch).toHaveBeenCalledWith('/invites/inv1/revoke');
  });

  it('redeem() calls POST /invites/redeem/:token', async () => {
    api.post.mockResolvedValue({ group: { id: 'g1' } });
    await inviteLinksService.redeem('abc-token');
    expect(api.post).toHaveBeenCalledWith('/invites/redeem/abc-token');
  });
});
