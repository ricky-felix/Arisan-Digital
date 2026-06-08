import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, VALID_TOKEN } from './helpers/app.helper';

describe('Notifications (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth guard ────────────────────────────────────────────────────────────

  it('GET /api/notifications → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/notifications')
      .expect(401);
  });

  it('GET /api/notifications/unread-count → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/notifications/unread-count')
      .expect(401);
  });

  it('POST /api/notifications/:id/read → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/notifications/some-id/read')
      .expect(401);
  });

  it('POST /api/notifications/read-all → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/notifications/read-all')
      .expect(401);
  });

  // ── Routing ───────────────────────────────────────────────────────────────

  it('GET /api/notifications → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/notifications')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('GET /api/notifications/unread-count → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('POST /api/notifications/read-all → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .post('/api/notifications/read-all')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('POST /api/notifications/:id/read → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .post('/api/notifications/00000000-0000-0000-0000-000000000001/read')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });
});
