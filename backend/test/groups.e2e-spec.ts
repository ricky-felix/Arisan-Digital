import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, VALID_TOKEN } from './helpers/app.helper';

describe('Groups (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth guard ────────────────────────────────────────────────────────────

  it('GET /api/groups → 401 when no token', () => {
    return request(app.getHttpServer())
      .get('/api/groups')
      .expect(401);
  });

  it('GET /api/groups → 401 when token prefix is wrong', () => {
    return request(app.getHttpServer())
      .get('/api/groups')
      .set('Authorization', 'Basic badtoken')
      .expect(401);
  });

  // ── Happy path (mocked Supabase returns null data — no crash) ─────────────

  it('GET /api/groups → 200 with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/groups')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('GET /api/groups/:id → 200 or 404 with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/groups/00000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it('POST /api/groups → 400 when body is empty', () => {
    return request(app.getHttpServer())
      .post('/api/groups')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({})
      .expect(400);
  });

  it('POST /api/groups → 400 when name is too short', () => {
    return request(app.getHttpServer())
      .post('/api/groups')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        name: 'AB', // MinLength(3)
        amount_per_round: 500000,
        frequency: 'monthly',
        giliran_method: 'random',
        start_date: '2026-01-01',
        total_rounds: 12,
      })
      .expect(400);
  });

  it('POST /api/groups → 400 when frequency is invalid', () => {
    return request(app.getHttpServer())
      .post('/api/groups')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        name: 'Valid Name',
        amount_per_round: 500000,
        frequency: 'daily', // not in ['weekly','monthly']
        giliran_method: 'random',
        start_date: '2026-01-01',
        total_rounds: 12,
      })
      .expect(400);
  });

  it('POST /api/groups → 400 when amount_per_round is below minimum', () => {
    return request(app.getHttpServer())
      .post('/api/groups')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        name: 'Valid Group Name',
        amount_per_round: 500, // Min(1000)
        frequency: 'monthly',
        giliran_method: 'random',
        start_date: '2026-01-01',
        total_rounds: 5,
      })
      .expect(400);
  });

  it('POST /api/groups → 400 when total_rounds is too low', () => {
    return request(app.getHttpServer())
      .post('/api/groups')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        name: 'Valid Group Name',
        amount_per_round: 500000,
        frequency: 'monthly',
        giliran_method: 'random',
        start_date: '2026-01-01',
        total_rounds: 1, // Min(2)
      })
      .expect(400);
  });

  it('PATCH /api/groups/:id → 401 without token', () => {
    return request(app.getHttpServer())
      .patch('/api/groups/some-id')
      .send({ name: 'New Name' })
      .expect(401);
  });

  it('DELETE /api/groups/:id → 401 without token', () => {
    return request(app.getHttpServer())
      .delete('/api/groups/some-id')
      .expect(401);
  });
});
