import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

/**
 * Accepted payment-method types — e-wallets only for now.
 * E-wallet types: gopay, ovo, dana, shopeepay, linkaja
 *
 * NOTE: bank transfer and QRIS are deferred. account_number/holder_name and
 * qris_image_path remain as optional fields so either can be re-introduced
 * without a data migration.
 */
export enum PaymentMethodType {
  GOPAY = 'gopay',
  OVO = 'ovo',
  DANA = 'dana',
  SHOPEEPAY = 'shopeepay',
  LINKAJA = 'linkaja',
}

/** E-wallet types that require a phone number */
const EWALLET_TYPES: PaymentMethodType[] = [
  PaymentMethodType.GOPAY,
  PaymentMethodType.OVO,
  PaymentMethodType.DANA,
  PaymentMethodType.SHOPEEPAY,
  PaymentMethodType.LINKAJA,
];

export class CreatePaymentMethodDto {
  /**
   * Payment method type.
   * Bank: "bank" | "bca" | "mandiri" | "bni" | "bri" | "cimb" | "permata"
   * E-Wallet: "gopay" | "ovo" | "dana" | "shopeepay" | "linkaja"
   * Other: "qris"
   */
  @IsEnum(PaymentMethodType, {
    message: `type must be one of: ${Object.values(PaymentMethodType).join(', ')}`,
  })
  type: PaymentMethodType;

  /** User-defined display label, e.g. "BCA Utama" */
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  label: string;

  /**
   * Bank account number — reserved for the (deferred) bank-transfer type.
   * Unused for e-wallets / QRIS.
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{6,20}$/, {
    message: 'account_number must be 6–20 digits (numeric only, no spaces)',
  })
  account_number?: string | null;

  /**
   * Account holder name — reserved for the (deferred) bank-transfer type.
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  holder_name?: string | null;

  /**
   * E-wallet phone number — numeric, 8–15 digits.
   * Optionally starts with 62 (Indonesian country code) or 0.
   * Required when type is an e-wallet type.
   */
  @ValidateIf((o) => EWALLET_TYPES.includes(o.type))
  @IsString()
  @Matches(/^\d{8,15}$/, {
    message: 'phone must be 8–15 digits (numeric only). Strip leading + before sending.',
  })
  phone?: string | null;

  /**
   * QRIS image storage path, e.g. "users/{userId}/qris/{methodId}.jpg".
   * Optional — Phase 4 feature; accepted but image upload itself is deferred.
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  qris_image_path?: string | null;

  /**
   * Whether this is the user's default/primary payment method.
   * Only one method can be primary at a time. If true, all others are
   * automatically demoted to false by the service layer.
   */
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}
