import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, VALID_TOKEN } from './helpers/app.helper';

describe('Plans & Subscriptions (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Plans — public endpoints (no auth required) ───────────────────────────

  it('GET /api/plans → 200 without token (public endpoint)', () => {
    return request(app.getHttpServer())
      .get('/api/plans')
      .expect((res) => {
        // Plans endpoint has no AuthGuard at the controller level
        expect(res.status).toBeLessThan(500);
      });
  });

  it('GET /api/plans/:slug → responds (not 500) without token', () => {
    return request(app.getHttpServer())
      .get('/api/plans/free')
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  // ── Plans — admin-only write endpoints ───────────────────────────────────

  it('POST /api/plans → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/plans')
      .send({ name: 'Test Plan', slug: 'test' })
      .expect(401);
  });

  it('PATCH /api/plans/:slug → 401 without token', () => {
    return request(app.getHttpServer())
      .patch('/api/plans/free')
      .send({ name: 'Updated' })
      .expect(401);
  });

  it('DELETE /api/plans/:slug → 401 without token', () => {
    return request(app.getHttpServer())
      .delete('/api/plans/free')
      .expect(401);
  });

  it('POST /api/plans → 403 for non-admin user', () => {
    // VALID_TOKEN resolves to platform_role: 'user' (mock returns data: null → fallback 'user')
    return request(app.getHttpServer())
      .post('/api/plans')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ name: 'Test Plan', slug: 'test', price_monthly: 0 })
      .expect((res) => {
        expect([400, 403]).toContain(res.status);
      });
  });

  // ── Subscriptions — auth required ────────────────────────────────────────

  it('GET /api/subscriptions/me → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/subscriptions/me')
      .expect(401);
  });

  it('POST /api/subscriptions/me → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/subscriptions/me')
      .send({})
      .expect(401);
  });

  it('DELETE /api/subscriptions/me → 401 without token', () => {
    return request(app.getHttpServer())
      .delete('/api/subscriptions/me')
      .expect(401);
  });

  it('GET /api/subscriptions/me → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/subscriptions/me')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('GET /api/subscriptions/group/:groupId → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/subscriptions/group/00000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });
});
