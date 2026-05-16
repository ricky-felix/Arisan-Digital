import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private adminClient: SupabaseClient;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.adminClient = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  get admin(): SupabaseClient {
    return this.adminClient;
  }

  // Returns a client that honours row-level security for the given user JWT
  forUser(accessToken: string): SupabaseClient {
    return createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      },
    );
  }

  async verifyToken(token: string) {
    const { data, error } = await this.adminClient.auth.getUser(token);
    if (error) throw error;
    return data.user;
  }
}
