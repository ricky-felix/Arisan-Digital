import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetPinDto } from './dto/set-pin.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';
import { UpsertBankAccountDto } from './dto/upsert-bank-account.dto';
import type { AuthUser } from '../common/types/schema.types';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  // Super-admin only: full user list for the platform-wide dashboard
  @Get()
  @Roles('super_admin')
  listAll() {
    return this.usersService.listAll();
  }

  // ─────────────────────────────────────────────────
  // C2 — PIN SECURITY
  // ─────────────────────────────────────────────────

  /** Set or change the 6-digit PIN. Hashes before storage; never returns the hash. */
  @Patch('me/pin')
  setPin(@CurrentUser() user: AuthUser, @Body() dto: SetPinDto) {
    return this.usersService.setPin(user.id, dto);
  }

  /** Verify the user's PIN. Returns { valid: boolean }. */
  @Post('me/pin/verify')
  verifyPin(@CurrentUser() user: AuthUser, @Body() dto: VerifyPinDto) {
    return this.usersService.verifyPin(user.id, dto);
  }

  /** Get security status (has_pin, app_lock_enabled). Never returns the hash. */
  @Get('me/security')
  getSecurity(@CurrentUser() user: AuthUser) {
    return this.usersService.getSecurity(user.id);
  }

  /** Enable or disable app lock. Returns updated security state. */
  @Patch('me/security')
  updateSecurity(@CurrentUser() user: AuthUser, @Body() dto: UpdateSecurityDto) {
    return this.usersService.updateSecurity(user.id, dto);
  }

  // ─────────────────────────────────────────────────
  // C3 — PAYOUT / BANK ACCOUNT
  // ─────────────────────────────────────────────────

  /** Returns the saved bank account or null. */
  @Get('me/bank-account')
  getBankAccount(@CurrentUser() user: AuthUser) {
    return this.usersService.getBankAccount(user.id);
  }

  /** Upsert bank account details. Returns the saved object. */
  @Put('me/bank-account')
  upsertBankAccount(@CurrentUser() user: AuthUser, @Body() dto: UpsertBankAccountDto) {
    return this.usersService.upsertBankAccount(user.id, dto);
  }

  /** Remove the bank account. Returns { success: true }. */
  @Delete('me/bank-account')
  deleteBankAccount(@CurrentUser() user: AuthUser) {
    return this.usersService.deleteBankAccount(user.id);
  }
}
