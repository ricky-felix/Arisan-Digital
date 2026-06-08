/**
 * Shared bootstrap helper for all e2e specs.
 *
 * Strategy: import the real AppModule but override SupabaseService with a
 * mock so no live Supabase connection is required. The mock's `verifyToken`
 * returns a fake user, and `admin` is a jest-mock chainable Supabase-like
 * builder that always resolves with { data: null, error: null }.
 *
 * Required env vars (set here to satisfy ConfigModule.getOrThrow):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { SupabaseService } from '../../src/supabase/supabase.service';

// Inject dummy env before any module initialisation
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// ─── Mock Supabase ──────────────────────────────────────────────────────────

export const FAKE_USER_ID = 'aaaaaaaa-0000-0000-0000-000000000001';
export const FAKE_USER_EMAIL = 'test@example.com';
export const FAKE_ADMIN_ID = 'aaaaaaaa-0000-0000-0000-000000000002';
export const VALID_TOKEN = 'valid-test-token';
export const ADMIN_TOKEN = 'admin-test-token';

/** Builds the chainable mock returned by .from().select().eq()...etc. */
function makeQueryBuilder(result: { data: unknown; error: null }) {
  const builder: Record<string, unknown> = {};
  const returnSelf = () => builder;

  for (const method of [
    'select', 'eq', 'neq', 'in', 'is', 'gt', 'lt', 'gte', 'lte',
    'order', 'limit', 'range', 'or', 'filter', 'not',
    'insert', 'update', 'delete', 'upsert',
  ]) {
    builder[method] = returnSelf;
  }

  // Terminal resolvers
  builder['single'] = () => Promise.resolve(result);
  builder['maybeSingle'] = () => Promise.resolve(result);
  builder['then'] = (resolve: (v: typeof result) => void) => {
    Promise.resolve(result).then(resolve);
    return builder;
  };

  return builder;
}

function buildAdminMock() {
  return {
    from: jest.fn().mockReturnValue(
      makeQueryBuilder({ data: null, error: null }),
    ),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: FAKE_USER_ID, email: FAKE_USER_EMAIL } },
        error: null,
      }),
    },
    storage: {
      from: jest.fn().mockReturnValue({
        createSignedUploadUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: 'https://example.com/upload', token: 'tok' },
          error: null,
        }),
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: 'https://example.com/read' },
          error: null,
        }),
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
      }),
    },
  };
}

export function buildMockSupabaseService() {
  const adminMock = buildAdminMock();

  return {
    get admin() {
      return adminMock;
    },
    forUser: jest.fn().mockReturnValue(adminMock),
    verifyToken: jest.fn().mockImplementation((token: string) => {
      if (token === VALID_TOKEN) {
        return Promise.resolve({ id: FAKE_USER_ID, email: FAKE_USER_EMAIL });
      }
      if (token === ADMIN_TOKEN) {
        return Promise.resolve({ id: FAKE_ADMIN_ID, email: 'admin@example.com' });
      }
      return Promise.reject(new Error('invalid token'));
    }),
    // Satisfy NestJS lifecycle hooks
    onModuleInit: jest.fn(),
  };
}

// ─── App factory ────────────────────────────────────────────────────────────

export async function createTestApp(): Promise<{
  app: INestApplication;
  mockSupabase: ReturnType<typeof buildMockSupabaseService>;
}> {
  const mockSupabase = buildMockSupabaseService();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(SupabaseService)
    .useValue(mockSupabase)
    .compile();

  const app = moduleFixture.createNestApplication();

  // Mirror main.ts setup
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  await app.init();

  return { app, mockSupabase };
}
