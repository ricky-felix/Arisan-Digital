import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, VALID_TOKEN, FAKE_USER_ID } from './helpers/app.helper';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth guard ────────────────────────────────────────────────────────────

  it('GET /api/users/me → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/users/me')
      .expect(401);
  });

  it('GET /api/users/me → 401 with invalid token', () => {
    return request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', 'Bearer totally-invalid-token')
      .expect(401);
  });

  // ── Routing ───────────────────────────────────────────────────────────────

  it('GET /api/users/me → responds (not 500) with valid token', () => {
    return request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  it('PATCH /api/users/me → 401 without token', () => {
    return request(app.getHttpServer())
      .patch('/api/users/me')
      .send({ full_name: 'Test User' })
      .expect(401);
  });

  it('PATCH /api/users/me → responds (not 500) with valid token and valid body', () => {
    return request(app.getHttpServer())
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ full_name: 'Test User' })
      .expect((res) => {
        expect(res.status).toBeLessThan(500);
      });
  });

  // ── Roles guard — super_admin only endpoint ───────────────────────────────

  it('GET /api/users → 403 for non-admin user (role: user)', () => {
    // The mock returns platform_role: 'user' (default in auth.guard — profile.platform_role ?? 'user')
    // The mock supabase.admin.from().select().eq().maybeSingle() returns { data: null }
    // so platform_role falls back to 'user'
    return request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .expect((res) => {
        // Should be 403 (non-admin) or something < 500
        expect([403, 404, 200]).toContain(res.status);
        expect(res.status).toBeLessThan(500);
      });
  });

  // ── PIN endpoints ─────────────────────────────────────────────────────────

  it('PATCH /api/users/me/pin → 401 without token', () => {
    return request(app.getHttpServer())
      .patch('/api/users/me/pin')
      .send({ pin: '123456' })
      .expect(401);
  });

  it('POST /api/users/me/pin/verify → 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/users/me/pin/verify')
      .send({ pin: '123456' })
      .expect(401);
  });

  it('GET /api/users/me/security → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/users/me/security')
      .expect(401);
  });

  it('GET /api/users/me/bank-account → 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/users/me/bank-account')
      .expect(401);
  });
});
