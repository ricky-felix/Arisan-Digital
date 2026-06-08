import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/schema.types';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

/**
 * Payment Methods endpoints — Phase 1 (schema + CRUD + peer masking).
 *
 * All routes are mounted under /users (same controller prefix as UsersController).
 * AuthGuard enforces a valid Bearer JWT on every route.
 *
 * Compliance note: this controller is a DIRECTORY only.
 * No funds are held, routed, or processed — see PRD Section ⚖️.
 */
@Controller('users')
@UseGuards(AuthGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  // ─────────────────────────────────────────────
  // Owner routes — /users/me/payment-methods
  // ─────────────────────────────────────────────

  /**
   * GET /users/me/payment-methods
   * Returns the authenticated user's own payment methods, unmasked.
   *
   * Response 200:
   * { "data": [ { id, type, label, account_number, holder_name, phone,
   *               qris_image_path, is_primary, created_at, updated_at }, ... ] }
   */
  @Get('me/payment-methods')
  listOwn(@CurrentUser() user: AuthUser) {
    return this.paymentMethodsService.listOwn(user.id);
  }

  /**
   * POST /users/me/payment-methods
   * Creates a new payment method for the authenticated user.
   * If is_primary: true, all existing methods are demoted.
   *
   * Response 201: The created payment method object.
   */
  @Post('me/payment-methods')
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.create(user.id, dto);
  }

  /**
   * PUT /users/me/payment-methods/:id
   * Updates an existing payment method.
   * type cannot be changed (PRD constraint).
   *
   * Response 200: The updated payment method object.
   * Response 404: If the method id is not found.
   */
  @Put('me/payment-methods/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(user.id, id, dto);
  }

  /**
   * DELETE /users/me/payment-methods/:id
   * Removes a payment method by id.
   * If deleted method was primary, the oldest remaining is auto-promoted.
   *
   * Response 204: No content.
   * Response 404: If the method id is not found.
   */
  @Delete('me/payment-methods/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.paymentMethodsService.delete(user.id, id);
  }

  // ─────────────────────────────────────────────
  // Peer route — /users/:userId/payment-methods
  // Used by the settlement / pay flow to show payee's methods.
  // ─────────────────────────────────────────────

  /**
   * GET /users/:userId/payment-methods
   * Returns a peer user's payment methods.
   *
   * - If requester === userId: returns full unmasked data (same as GET me).
   * - If requester is a group co-member of userId: returns masked data
   *   (account_number → "••••XXXX", phone → "••••XXXX"; holder_name in full).
   * - Otherwise: throws 403 Forbidden.
   *
   * Response 200:
   * { "data": [ { id, type, label, account_number (masked), holder_name,
   *               phone (masked), qris_image_path, is_primary, created_at }, ... ] }
   *
   * NOTE: This route is declared AFTER the me/* routes so NestJS does not
   * misinterpret "me" as a :userId param.
   */
  @Get(':userId/payment-methods')
  listForPeer(
    @CurrentUser() user: AuthUser,
    @Param('userId') userId: string,
  ) {
    return this.paymentMethodsService.listForPeer(userId, user.id);
  }
}
