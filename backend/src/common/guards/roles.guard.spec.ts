import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import type { AuthUser, PlatformRole } from '../types/schema.types';

function makeContext(user: AuthUser | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

function makeReflector(required: PlatformRole[] | undefined): Reflector {
  return {
    getAllAndOverride: () => required,
  } as unknown as Reflector;
}

describe('RolesGuard', () => {
  it('allows when no roles metadata is set', () => {
    const guard = new RolesGuard(makeReflector(undefined));
    expect(guard.canActivate(makeContext({ id: 'x', platform_role: 'user' }))).toBe(true);
  });

  it('allows when required roles array is empty', () => {
    const guard = new RolesGuard(makeReflector([]));
    expect(guard.canActivate(makeContext({ id: 'x', platform_role: 'user' }))).toBe(true);
  });

  it('allows when the user has one of the required roles', () => {
    const guard = new RolesGuard(makeReflector(['super_admin']));
    expect(
      guard.canActivate(makeContext({ id: 'x', platform_role: 'super_admin' })),
    ).toBe(true);
  });

  it('rejects when the user does not have a required role', () => {
    const guard = new RolesGuard(makeReflector(['super_admin']));
    expect(() =>
      guard.canActivate(makeContext({ id: 'x', platform_role: 'user' })),
    ).toThrow(ForbiddenException);
  });

  it('rejects when no user is on the request', () => {
    const guard = new RolesGuard(makeReflector(['user']));
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });
});
