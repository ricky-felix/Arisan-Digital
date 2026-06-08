import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, VALID_TOKEN } from './helpers/app.helper';

describe('Payments (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth guard ────────────────────────────────────────────────────────────

  it('GET /api/payments/me → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/payments/me')
      .expect(401);
  });

  it('GET /api/payments/group/:groupId → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/payments/group/some-group-id')
      .expect(401);
  });

  it('GET /api/payments/round/:roundId → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/payments/round/some-round-id')
      .expect(401);
  });

  it('POST /api/payments → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/payments')
      .send({})
      .expect(401);
  });

  // ── Routing ───────────────────────────────────────────────────────────────

  it('GET /api/payments/me → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/payments/me')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('GET /api/payments/group/:groupId → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/payments/group/00000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it('POST /api/payments → 400 when body is empty', () => {
    return request(app.getHttpServer())
      .post('/api/payments')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({})
      .expect(400);
  });

  it('POST /api/payments → 400 when round_id is not a UUID', () => {
    return request(app.getHttpServer())
      .post('/api/payments')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        round_id: 'not-a-uuid',
        amount: 500000,
      })
      .expect(400);
  });

  it('POST /api/payments → 400 when amount is below minimum (1000)', () => {
    return request(app.getHttpServer())
      .post('/api/payments')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        round_id: '00000000-0000-0000-0000-000000000001',
        amount: 100, // Min(1000)
      })
      .expect(400);
  });

  it('PATCH /api/payments/:id/confirm → 401 without token', () => {
    return request(app.getHttpServer())
      .patch('/api/payments/some-id/confirm')
      .expect(401);
  });

  it('PATCH /api/payments/:id/reject → 401 without token', () => {
    return request(app.getHttpServer())
      .patch('/api/payments/some-id/reject')
      .send({ reason: 'bad proof' })
      .expect(401);
  });
});
