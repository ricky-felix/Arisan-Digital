/**
 * Static metadata for payment method types.
 *
 * Compliance rule (PRD §⚖️): only TEXT labels — no logo image assets.
 *
 * NOTE: only e-wallets are offered for now. Bank transfer and QRIS are deferred:
 *   - bank → until scale (account_number/holder_name already in the data shape)
 *   - QRIS → until the image-upload (Phase 4) is built, so it isn't a dead option
 * Re-add the type here + in the backend enum to bring either back.
 */

/** All supported type values (matches backend enum in CreatePaymentMethodDto). */
export const PAYMENT_METHOD_TYPES = ['gopay', 'ovo', 'dana', 'shopeepay', 'linkaja'];

/** Human-readable labels for each type. Text only — no logos. */
export const TYPE_LABELS = {
  gopay:     'GoPay',
  ovo:       'OVO',
  dana:      'DANA',
  shopeepay: 'ShopeePay',
  linkaja:   'LinkAja',
};

/** Which category each type belongs to (for grouping in the type-picker). */
export const TYPE_CATEGORY = {
  gopay:     'ewallet',
  ovo:       'ewallet',
  dana:      'ewallet',
  shopeepay: 'ewallet',
  linkaja:   'ewallet',
};

/** Ordered groups (used to keep a stable type order in the combined picker). */
export const TYPE_GROUP_ORDER = ['ewallet'];

export const TYPE_GROUP_LABELS = {
  ewallet: 'E-Wallet',
};

/** E-wallet types — used for conditional field rendering. */
export const EWALLET_TYPES = ['gopay', 'ovo', 'dana', 'shopeepay', 'linkaja'];

/** Placeholder label suggestions per type. */
export const TYPE_LABEL_SUGGESTIONS = {
  gopay:     'mis. GoPay Pribadi',
  ovo:       'mis. OVO',
  dana:      'mis. DANA Utama',
  shopeepay: 'mis. ShopeePay',
  linkaja:   'mis. LinkAja',
};
