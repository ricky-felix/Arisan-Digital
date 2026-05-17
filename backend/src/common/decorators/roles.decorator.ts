import { SetMetadata } from '@nestjs/common';
import type { PlatformRole } from '../types/schema.types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PlatformRole[]) => SetMetadata(ROLES_KEY, roles);
