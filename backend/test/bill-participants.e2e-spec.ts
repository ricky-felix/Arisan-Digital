import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, VALID_TOKEN } from './helpers/app.helper';

describe('Bill Participants (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth guard ────────────────────────────────────────────────────────────

  it('POST /api/bills/:billId/participants → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/bills/some-bill-id/participants')
      .send({})
      .expect(401);
  });

  it('DELETE /api/bills/:billId/participants/:participantId → 401 without token', () => {
    return request(app.getHttpServer())
      .delete('/api/bills/some-bill-id/participants/some-participant-id')
      .expect(401);
  });

  // ── Routing ───────────────────────────────────────────────────────────────

  it('POST /api/bills/:billId/participants → responds (not 500) with valid token and valid body', () => {
    return request(app.getHttpServer())
      .post('/api/bills/00000000-0000-0000-0000-000000000001/participants')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ user_id: '00000000-0000-0000-0000-000000000002' })
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('DELETE /api/bills/:billId/participants/:participantId → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .delete('/api/bills/00000000-0000-0000-0000-000000000001/participants/00000000-0000-0000-0000-000000000002')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });
});
