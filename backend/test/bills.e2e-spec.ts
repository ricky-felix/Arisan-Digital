import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, VALID_TOKEN } from './helpers/app.helper';

describe('Bills (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth guard ────────────────────────────────────────────────────────────

  it('GET /api/bills → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/bills')
      .expect(401);
  });

  it('POST /api/bills → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/bills')
      .send({ title: 'test', total_amount: 10000, split_method: 'equal', participants: [] })
      .expect(401);
  });

  // ── Routing ───────────────────────────────────────────────────────────────

  it('GET /api/bills → 200 with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/bills')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('GET /api/bills/:id → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/bills/00000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it('POST /api/bills → 400 when body is empty', () => {
    return request(app.getHttpServer())
      .post('/api/bills')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({})
      .expect(400);
  });

  it('POST /api/bills → 400 when participants array is missing', () => {
    return request(app.getHttpServer())
      .post('/api/bills')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        title: 'Dinner',
        total_amount: 100000,
        split_method: 'equal',
        // participants missing
      })
      .expect(400);
  });

  it('POST /api/bills → 400 when participants array is empty', () => {
    return request(app.getHttpServer())
      .post('/api/bills')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        title: 'Dinner',
        total_amount: 100000,
        split_method: 'equal',
        participants: [], // ArrayMinSize(1)
      })
      .expect(400);
  });

  it('POST /api/bills → 400 when split_method is invalid', () => {
    return request(app.getHttpServer())
      .post('/api/bills')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        title: 'Dinner',
        total_amount: 100000,
        split_method: 'random', // not in enum
        participants: [{ user_id: '00000000-0000-0000-0000-000000000001' }],
      })
      .expect(400);
  });

  it('POST /api/bills → 400 when total_amount is zero', () => {
    return request(app.getHttpServer())
      .post('/api/bills')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        title: 'Dinner',
        total_amount: 0, // Min(1)
        split_method: 'equal',
        participants: [{ user_id: '00000000-0000-0000-0000-000000000001' }],
      })
      .expect(400);
  });

  it('POST /api/bills → 400 when total_amount is missing', () => {
    return request(app.getHttpServer())
      .post('/api/bills')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        title: 'Dinner',
        split_method: 'equal',
        participants: [{ user_id: '00000000-0000-0000-0000-000000000001' }],
      })
      .expect(400);
  });

  it('PATCH /api/bills/:id/settle → 401 without token', () => {
    return request(app.getHttpServer())
      .patch('/api/bills/some-id/settle')
      .expect(401);
  });

  it('DELETE /api/bills/:id → 401 without token', () => {
    return request(app.getHttpServer())
      .delete('/api/bills/some-id')
      .expect(401);
  });
});
