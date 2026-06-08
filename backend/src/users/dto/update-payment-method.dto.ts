import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Update DTO for an existing payment method.
 *
 * NOTE: `type` is intentionally excluded — the PRD mandates that type
 * cannot be changed after creation (delete + re-add to change type).
 * All fields are optional; only provided fields are updated.
 */
export class UpdatePaymentMethodDto {
  /** User-defined display label, e.g. "BCA Savings" */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  label?: string;

  /**
   * Bank account number — numeric only, 6–20 digits.
   * Applicable only for bank-type methods.
   */
  @IsOptional()
  @Matches(/^\d{6,20}$/, {
    message: 'account_number must be 6–20 digits (numeric only, no spaces)',
  })
  account_number?: string | null;

  /**
   * Account holder name — alphanumeric + spaces, max 50 chars.
   * Applicable only for bank-type methods.
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  holder_name?: string | null;

  /**
   * E-wallet phone number — numeric, 8–15 digits.
   * Optionally starts with 62 (Indonesian country code) or 0.
   * Applicable only for e-wallet-type methods.
   */
  @IsOptional()
  @Matches(/^\d{8,15}$/, {
    message: 'phone must be 8–15 digits (numeric only). Strip leading + before sending.',
  })
  phone?: string | null;

  /**
   * QRIS image storage path.
   * Optional — Phase 4 feature; accepted but image upload itself is deferred.
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  qris_image_path?: string | null;

  /**
   * Promote this method to primary.
   * Setting true automatically demotes all other methods to is_primary: false.
   */
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}
