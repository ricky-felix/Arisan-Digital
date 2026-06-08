import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SyncPhoneDto } from './dto/sync-phone.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Public on purpose — the frontend calls this right after `supabase.auth.signUp`,
   * and when email confirmation is enabled there is no session yet. The handler
   * only promotes a user's own already-stored metadata phone onto their auth
   * record, so no authentication is required (and none is available).
   */
  @Post('sync-phone')
  @HttpCode(200)
  syncPhone(@Body() dto: SyncPhoneDto) {
    return this.authService.syncPhone(dto.userId);
  }
}
