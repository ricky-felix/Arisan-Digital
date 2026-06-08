import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, VALID_TOKEN } from './helpers/app.helper';

describe('Invite Links (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth guard ────────────────────────────────────────────────────────────

  it('POST /api/invites → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/invites')
      .send({})
      .expect(401);
  });

  it('GET /api/invites/group/:groupId → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/invites/group/some-group-id')
      .expect(401);
  });

  it('POST /api/invites/redeem/:token → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/invites/redeem/SOME-CODE')
      .expect(401);
  });

  it('PATCH /api/invites/:id/revoke → 401 without token', () => {
    return request(app.getHttpServer())
      .patch('/api/invites/some-id/revoke')
      .expect(401);
  });

  // ── Routing ───────────────────────────────────────────────────────────────

  it('GET /api/invites/group/:groupId → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/invites/group/00000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it('POST /api/invites → 400 when body is empty (group_id missing)', () => {
    return request(app.getHttpServer())
      .post('/api/invites')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({})
      .expect(400);
  });

  it('POST /api/invites → 400 when group_id is not a UUID', () => {
    return request(app.getHttpServer())
      .post('/api/invites')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ group_id: 'not-a-uuid' })
      .expect(400);
  });

  it('POST /api/invites → 400 when max_uses is zero', () => {
    return request(app.getHttpServer())
      .post('/api/invites')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        group_id: '00000000-0000-0000-0000-000000000001',
        max_uses: 0, // Min(1)
      })
      .expect(400);
  });

  it('POST /api/invites → responds (not 500) with valid payload', () => {
    return request(app.getHttpServer())
      .post('/api/invites')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        group_id: '00000000-0000-0000-0000-000000000001',
        max_uses: 5,
        expires_at: '2027-01-01',
      })
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('POST /api/invites/redeem/:token → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .post('/api/invites/redeem/ABC123')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });
});
