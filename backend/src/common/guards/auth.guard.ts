import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { AuthUser, PlatformRole } from '../types/schema.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    let authUser;
    try {
      authUser = await this.supabase.verifyToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const { data: profile } = await this.supabase.admin
      .from('users')
      .select('platform_role')
      .eq('id', authUser.id)
      .maybeSingle();

    const user: AuthUser = {
      id: authUser.id,
      email: authUser.email,
      platform_role: (profile?.platform_role as PlatformRole) ?? 'user',
    };

    request.user = user;
    request.accessToken = token;
    return true;
  }
}
