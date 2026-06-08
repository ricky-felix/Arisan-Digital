import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, VALID_TOKEN } from './helpers/app.helper';

describe('Bill Settlements (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth guard ────────────────────────────────────────────────────────────

  it('POST /api/settlements → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/settlements')
      .send({})
      .expect(401);
  });

  it('GET /api/settlements/me → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/settlements/me')
      .expect(401);
  });

  it('GET /api/settlements/bill/:billId → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/settlements/bill/some-bill-id')
      .expect(401);
  });

  it('PATCH /api/settlements/:id/confirm → 401 without token', () => {
    return request(app.getHttpServer())
      .patch('/api/settlements/some-id/confirm')
      .expect(401);
  });

  it('PATCH /api/settlements/:id/reject → 401 without token', () => {
    return request(app.getHttpServer())
      .patch('/api/settlements/some-id/reject')
      .expect(401);
  });

  // ── Routing ───────────────────────────────────────────────────────────────

  it('GET /api/settlements/me → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/settlements/me')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('GET /api/settlements/bill/:billId → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/settlements/bill/00000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it('POST /api/settlements → 400 when body is empty', () => {
    return request(app.getHttpServer())
      .post('/api/settlements')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({})
      .expect(400);
  });

  it('POST /api/settlements → 400 when bill_id is not a UUID', () => {
    return request(app.getHttpServer())
      .post('/api/settlements')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        bill_id: 'not-a-uuid',
        receiver_id: '00000000-0000-0000-0000-000000000001',
        amount: 50000,
      })
      .expect(400);
  });

  it('POST /api/settlements → 400 when amount is zero', () => {
    return request(app.getHttpServer())
      .post('/api/settlements')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        bill_id: '00000000-0000-0000-0000-000000000001',
        receiver_id: '00000000-0000-0000-0000-000000000002',
        amount: 0, // Min(1)
      })
      .expect(400);
  });

  it('POST /api/settlements → 400 when receiver_id is missing', () => {
    return request(app.getHttpServer())
      .post('/api/settlements')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        bill_id: '00000000-0000-0000-0000-000000000001',
        amount: 50000,
        // receiver_id missing
      })
      .expect(400);
  });
});
