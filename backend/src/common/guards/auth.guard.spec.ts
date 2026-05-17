import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from '../../supabase/supabase.service';

function makeContext(headers: Record<string, string> = {}): {
  ctx: ExecutionContext;
  request: { headers: Record<string, string>; user?: unknown; accessToken?: string };
} {
  const request: { headers: Record<string, string>; user?: unknown; accessToken?: string } = {
    headers,
  };
  const ctx = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { ctx, request };
}

describe('AuthGuard', () => {
  it('rejects requests with no Authorization header', async () => {
    const guard = new AuthGuard({} as SupabaseService);
    const { ctx } = makeContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects requests with a non-Bearer Authorization header', async () => {
    const guard = new AuthGuard({} as SupabaseService);
    const { ctx } = makeContext({ authorization: 'Basic abc' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects when verifyToken throws', async () => {
    const supabase = {
      verifyToken: jest.fn().mockRejectedValue(new Error('bad token')),
      admin: { from: jest.fn() },
    } as unknown as SupabaseService;
    const guard = new AuthGuard(supabase);
    const { ctx } = makeContext({ authorization: 'Bearer xyz' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('populates request.user with default role "user" when no profile row exists', async () => {
    const supabase = {
      verifyToken: jest.fn().mockResolvedValue({ id: 'u-1', email: 'a@b.com' }),
      admin: {
        from: jest.fn().mockReturnValue({
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null }),
            }),
          }),
        }),
      },
    } as unknown as SupabaseService;

    const guard = new AuthGuard(supabase);
    const { ctx, request } = makeContext({ authorization: 'Bearer good-token' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'u-1', email: 'a@b.com', platform_role: 'user' });
    expect(request.accessToken).toBe('good-token');
  });

  it('uses platform_role from the profile row when present', async () => {
    const supabase = {
      verifyToken: jest.fn().mockResolvedValue({ id: 'u-2', email: 's@b.com' }),
      admin: {
        from: jest.fn().mockReturnValue({
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: { platform_role: 'super_admin' } }),
            }),
          }),
        }),
      },
    } as unknown as SupabaseService;

    const guard = new AuthGuard(supabase);
    const { ctx, request } = makeContext({ authorization: 'Bearer s' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect((request.user as { platform_role: string }).platform_role).toBe('super_admin');
  });
});
