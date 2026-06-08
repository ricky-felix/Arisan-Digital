# PRD: Payment Methods (Metode Pembayaran) — Full Details with Account Accounts

**Status**: Ready for Implementation  
**Product**: Arisan Digital (Indonesian rotating-savings & bill-splitting web app)  
**Author**: Product Team  
**Last Updated**: 2026-06-08

---

## Handoff to Developer (MVP Implementation Slice)

**Start here.** The MVP cuts scope at:
- **Data model**: Evolve `users.payment_methods` from `string[]` to `payment_method_details JSONB` (array of objects with `{ type, label, account_number/phone, holder_name, qris_image_path?, is_primary }`).
- **Migration**: Backward-compatible; v0 `[]` → v1 `[]`, existing `["qris","gopay"]` → soft-migrated with a prompt on next edit.
- **Backend endpoints**: New `POST/PUT/DELETE /users/me/payment-methods/{id}` with validation + RLS (readable by group co-members).
- **Frontend**: Rewrite `MetodePembayaran.jsx` to be a detail-entry form, not a toggle list.
- **First integration**: Surface chosen methods (account details) on a new "Confirm Payment" sheet that appears before BuktiTransfer.
- **Timeline**: ~3–4 sprints. Deliverables in order: schema + API, frontend form, integration to settlement flow, QRIS image upload (deferred if needed).

> ⚠️ **Compliance guardrail (read the "Regulatory & Compliance Constraints" section before coding):** This feature is a **directory only** — it stores and displays users' own account details so members can pay each other **directly**. The app must **never hold, route, escrow, or process funds**, must **never generate/process QRIS** (display user-uploaded images only), and must use **bank/e-wallet names as text, never their logos**. Crossing any of these turns Arisan Digital into a regulated payment provider (Bank Indonesia PJP license).

---

## 1. Overview: Problem Statement & Goal

### The Gap Today
The current `MetodePembayaran.jsx` page asks users to select which payment methods they accept (QRIS, GoPay, OVO, BCA, etc.). However, **the implementation stores only the method IDs** (`payment_methods: ["qris", "gopay", "bca"]`), with no account details.

**Result**: When another member views "this person accepts BCA," they cannot actually pay—they don't know the account number, account holder name, or transfer details. They must message, call, or ask in the group chat to get the real information. This adds friction, defeats the feature's purpose, and creates duplicate data (the same account number stored in multiple places, unverified).

### The Job to Be Done
> "As a payer who owes another group member, I want to see their actual bank account numbers, e-wallet phone numbers, or QRIS codes so I can pay them immediately without asking for their contact details."

### Solution & Scope
Evolve the payment-methods feature from "which types I accept" into **"my complete payment accounts"** with real details. When a member initiates a settlement (either arisan or patungan), they'll see a summary of the payee's saved accounts and can choose which one to pay into.

---

## 2. Success Metrics

| Metric | Baseline | Target | Rationale |
|--------|----------|--------|-----------|
| **% users with ≥1 complete payment method** | 0% (feature doesn't exist yet) | 60%+ within 30 days of launch | Adoption rate; critical for the feature to unlock value. |
| **Avg # of payment methods per active user** | N/A | 1.5–2.0 | Diversity signals confidence; users adding backups. |
| **"What's your payment details?" messages in group chats** | Baseline TBD via sampling | -70% | Reduce friction; proxy for feature effectiveness. |
| **Settlement completion rate (% of initiated → confirmed)** | ~40% (current MVP) | 55%+ | Friction reduction should unblock more payments. |
| **Time-to-pay (settlement initiation → proof upload)** | ~45 min median | <20 min | Fewer back-and-forths; streamlined UX. |
| **QRIS upload rate (% of users with QRIS)** | N/A | 40%+ of those who add QRIS | Image adoption signals convenience. |
| **Payment method visibility by group members** | 0% (data not available) | 100% of settlement payees see details | Validate the integration works. |

---

## 3. User Stories & Acceptance Criteria

### Story 1: Add a New Payment Method
**As a** user setting up my profile  
**I want to** add a new payment method with full account details (not just a checkbox)  
**So that** others in my groups can pay me without asking for extra information.

**Acceptance Criteria:**
- [ ] UI: `MetodePembayaran` page shows a list of saved methods + a "+ Tambah Metode" button.
- [ ] Form fields by type:
  - **E-Wallet (GoPay, OVO, DANA, ShopeePay, LinkAja)**: Label (required), Phone Number (required, numeric, 8–15 digits), optional nickname.
  - **Bank (BCA, Mandiri, BNI, BRI, CIMB, Permata)**: Label (required), Account Number (required, numeric, 6–20 digits), Account Holder Name (required, text, max 50 chars).
  - **QRIS**: Label (required), optional QR image upload (max 5 MB, JPEG/PNG).
- [ ] Validation:
  - Account number: numeric only, no spaces; UI shows error if non-numeric.
  - Phone: numeric only, starts with 62 or 0 optional; UI shows error.
  - Holder name: alphanumeric + spaces; trim whitespace.
  - QRIS image: optional; if provided, validated server-side (JPEG/PNG, <5 MB).
- [ ] Success: Method saved to `payment_method_details JSONB` array; toast "Metode pembayaran disimpan ✓".
- [ ] Error handling: API errors surfaced inline + toast, allow user to retry.

**API Endpoint (Backend):**
```
POST /users/me/payment-methods
Content-Type: application/json

{
  "type": "bank",  // | "gopay" | "ovo" | "dana" | "shopeepay" | "linkaja" | "qris"
  "label": "BCA Utama",
  "account_number": "1234567890",
  "holder_name": "Ricky Felix",
  "phone": null,  // for e-wallet
  "qris_image_path": null,  // for QRIS
  "is_primary": true
}

Response 201:
{
  "id": "pm_abc123",
  "type": "bank",
  "label": "BCA Utama",
  "account_number": "1234567890",
  "holder_name": "Ricky Felix",
  "is_primary": true,
  "created_at": "2026-06-08T10:00:00Z"
}
```

---

### Story 2: Edit an Existing Payment Method
**As a** user who needs to update an account detail (new account, new phone number)  
**I want to** edit a saved payment method  
**So that** my payment information stays current.

**Acceptance Criteria:**
- [ ] UI: Each saved method in the list shows an edit (pencil) icon + delete (trash) icon.
- [ ] Clicking edit opens a modal/sheet identical to the add form, pre-filled with current data.
- [ ] User can change all fields except `type` (to avoid confusion; if type changes, delete & re-add).
- [ ] Can toggle `is_primary` (only one primary at a time; automatic demotion if another is set primary).
- [ ] Success: Updated method persisted; toast "Metode pembayaran diperbarui ✓".

**API Endpoint:**
```
PUT /users/me/payment-methods/{id}
Content-Type: application/json

{
  "label": "BCA Savings",
  "account_number": "9876543210",
  "holder_name": "Ricky Padang",
  "is_primary": false
}

Response 200: Updated method object.
```

---

### Story 3: Delete a Payment Method
**As a** user who no longer uses an account  
**I want to** remove a payment method from my profile  
**So that** stale/outdated details don't confuse others.

**Acceptance Criteria:**
- [ ] UI: Delete button (trash icon) on each method. Clicking shows a confirmation modal.
- [ ] Confirmation copy: "Hapus metode pembayaran ini? Orang lain tidak bisa membayar ke rekening ini lagi."
- [ ] On confirm: DELETE request sent; if success, method removed from list.
- [ ] If the deleted method was primary, auto-promote the oldest remaining method to primary (or leave empty if only one existed).
- [ ] Success: toast "Metode pembayaran dihapus".

**API Endpoint:**
```
DELETE /users/me/payment-methods/{id}

Response 204: No content.
```

---

### Story 4: Set a Primary/Default Payment Method
**As a** user with multiple payment methods  
**I want to** designate one as my default/preferred way to receive  
**So that** when others pay me, the default is pre-selected and recommended.

**Acceptance Criteria:**
- [ ] UI: Radio button or toggle next to each method in the list (e.g., "Utama" / "Primary").
- [ ] Only one method can be primary at a time.
- [ ] Clicking the radio button triggers an update API call (via Story 2 endpoint, setting `is_primary: true` on this one, `false` on others).
- [ ] Visual indicator: primary method has a different bg color or a badge "Utama".
- [ ] If no method is primary, the first (oldest) is treated as default in the settlement flow.

---

### Story 5: View Payment Methods in Settlement / Pay Flow
**As a** payer initiating a settlement payment  
**I want to** see the payee's saved payment methods and select which one to pay into  
**So that** I can immediately transfer without asking for details.

**Acceptance Criteria:**
- [ ] New "Confirm Payment Method" sheet appears after amount is set but before BuktiTransfer.
- [ ] Sheet displays:
  - Payee name + avatar.
  - List of payee's methods (readable via RLS; only show methods where user is group co-member).
  - For each method: type icon (bank/gopay/ovo/etc.) + label + **last 4 digits** (e.g., "BCA Utama – ••••7890") + flag if primary.
  - If QRIS image exists, show thumbnail.
- [ ] User selects one method; selection is passed to BuktiTransfer as a query param.
- [ ] BuktiTransfer displays selected method details (for reference when uploading proof).
- [ ] If payee has no methods, message: "Pembayar belum menambahkan metode pembayaran. Hubungi untuk konfirmasi rekening."

**RLS Policy (Supabase):**
Users can read a peer's payment methods only if they are co-members of at least one group (join via `group_members` table). See section 8 for full policy.

---

### Story 6: Upload QRIS Image
**As a** user adding a QRIS payment method  
**I want to** upload my QRIS QR code image so others can scan it  
**So that** payments are frictionless for e-wallet users.

**Acceptance Criteria:**
- [ ] Form: file input for QRIS upload (image/* MIME type, max 5 MB).
- [ ] Before form submission, user can preview the image.
- [ ] Upload flow:
  1. User picks image → show local preview.
  2. On form submit, call `POST /storage/upload-url` with bucket `payment-qris-codes`.
  3. Upload to signed URL.
  4. On success, include `qris_image_path` in the payment-method POST/PUT.
  5. Show "Siap dikirim" checkmark overlay.
- [ ] If upload fails, show error toast; allow user to retry.
- [ ] Optional: User can re-pick image by clicking "Ganti foto" button on preview (same pattern as BuktiTransfer).
- [ ] QRIS image URL is signed + read-protected (private bucket); URLs expire, but `qris_image_path` is durable and resolved fresh on every render.

---

## 4. Scope: IN vs. OUT

### IN SCOPE (MVP)
- [x] Data model: `payment_method_details` JSONB array with account details.
- [x] Add/edit/delete payment methods via modal forms.
- [x] Primary/default method selection.
- [x] QRIS image upload to private `payment-qris-codes` bucket.
- [x] RLS: Methods readable by group co-members; writable only by owner.
- [x] Integration: New "Select Payment Method" sheet in settlement flow (patungan + arisan).
- [x] BuktiTransfer displays selected method details (reference only).
- [x] Backward compatibility: existing `string[]` → soft-migrated on next edit.

### OUT OF SCOPE (Future / Not MVP)
- [ ] **Automatic payment deduction** (no payment gateway integration; app does not hold money, only facilitates transfers).
- [ ] **Payment confirmation automation** (no webhook-based auto-confirm from bank APIs; human-driven proof uploads remain).
- [ ] **Account validation** (no real-time bank account validation; accept user input as-is).
- [ ] **International payment methods** (scope is Indonesia only; no USD/BTC/forex).
- [ ] **Payment method deletion history** (no audit log; soft-delete not implemented).
- [ ] **Group-level payment-method policies** (e.g., "group admin enforces QRIS-only"). Possible future feature.
- [ ] **Mobile app version** (web only; frontend is React web app).
- [ ] **Stored payment proof images on user's payment methods** (settlement flow uses `BuktiTransfer` + `payment-proofs` bucket, not methods bucket).

---

## 5. Data Model & Database Schema

### Current State
```sql
-- users table (existing):
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  language TEXT DEFAULT 'id',
  platform_role TEXT DEFAULT 'user',
  gender TEXT CHECK (gender IN ('male', 'female')),
  payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb,  -- v0: string[], e.g. ["qris","gopay","bca"]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Proposed Migration (v0 → v1)

**Option A: Evolve the existing `payment_methods` JSONB column (RECOMMENDED)**

Advantage: Single column, minimal schema churn, backward-compatible.  
Drawback: JSONB loses some relational benefits (no direct indexes on account numbers, no easy count).

**Schema Addition:**
```sql
-- No new table; repurpose payment_methods as an array of objects.
-- Migration is soft: v0 data (["qris","gopay"]) coexists; frontend handles both.
--
-- payment_methods v1 shape:
-- [
--   {
--     "id": "pm_abc123",  -- UUID, immutable, generated by backend
--     "type": "bank" | "gopay" | "ovo" | "dana" | "shopeepay" | "linkaja" | "qris",
--     "label": "BCA Utama",
--     "account_number": "1234567890",  -- for bank; null for e-wallet
--     "holder_name": "Ricky Felix",      -- for bank; null for e-wallet
--     "phone": "628123456789",           -- for e-wallet; null for bank
--     "qris_image_path": "users/uuid/qris/image.jpg",  -- optional; null unless provided
--     "is_primary": true,
--     "created_at": "2026-06-08T10:00:00Z",
--     "updated_at": "2026-06-08T11:00:00Z"
--   }
-- ]
--
-- Migration SQL (idempotent, safe to run multiple times):
-- ALTER TABLE users ALTER COLUMN payment_methods SET DEFAULT '[]'::jsonb;
-- (No column-type change; data already JSONB.)
--
-- Comment explaining v1 schema:
COMMENT ON COLUMN users.payment_methods IS 
  'Array of payment method objects, each with { id, type, label, account_number, holder_name, phone, qris_image_path, is_primary, created_at, updated_at }. '
  'v0 legacy: bare string IDs (["qris","gopay"]); auto-migrated to v1 on next edit.';
```

**Option B: New `payment_methods` Table (REJECTED FOR MVP)**

If we anticipated complex queries or a high volume of payment methods per user, a dedicated table would be better. However:
- Users typically have 1–3 payment methods.
- JSONB queries in PostgreSQL are powerful (can index via GIN, query with `@>` operators).
- Table approach adds RLS complexity and joins.

**Decision**: Use Option A (JSONB array in `users.payment_methods`) for MVP. Revisit in future if schema shows contention or complexity.

---

### Backward Compatibility & Data Migration

**Scenario 1: User has v0 data** (`payment_methods: ["qris","gopay","bca"]`)
- On first load of new `MetodePembayaran`, frontend detects old format (array of strings, not objects).
- Show a banner: "Kami perbarui format metode pembayaran. Silakan lengkapi detail akun untuk setiap metode."
- Offer a **"Migrate"** button that pre-populates the form for each old method with placeholders: `type="qris", label="QRIS", account_number=""`, etc.
- User fills in real details and saves.
- Backend replaces old `["qris","gopay"]` with new v1 array of objects.

**Scenario 2: User is new** (or has no payment methods)
- Frontend skips migration; blank slate, "+ Tambah Metode" only.

**Frontend check in `MetodePembayaran.jsx`:**
```javascript
// Detect old format
const isLegacyFormat = Array.isArray(paymentMethods) && 
  paymentMethods.length > 0 && 
  typeof paymentMethods[0] === 'string';

if (isLegacyFormat) {
  // Show migration banner + pre-fill form
} else {
  // New v1 form
}
```

---

## 6. API Design

### Endpoints (Backend)

#### 1. List All Payment Methods (GET /users/me/payment-methods)
```
GET /users/me/payment-methods
Authorization: Bearer <JWT>

Response 200:
{
  "data": [
    {
      "id": "pm_abc123",
      "type": "bank",
      "label": "BCA Utama",
      "account_number": "1234567890",
      "holder_name": "Ricky Felix",
      "phone": null,
      "qris_image_path": null,
      "is_primary": true,
      "created_at": "2026-06-08T10:00:00Z",
      "updated_at": "2026-06-08T10:00:00Z"
    },
    {
      "id": "pm_def456",
      "type": "gopay",
      "label": "GoPay",
      "account_number": null,
      "holder_name": null,
      "phone": "628123456789",
      "qris_image_path": null,
      "is_primary": false,
      "created_at": "2026-06-08T10:05:00Z",
      "updated_at": "2026-06-08T10:05:00Z"
    }
  ]
}
```

**Implementation**: Extract and parse `users.payment_methods` JSONB, return v1 array. If legacy format detected, auto-convert on-the-fly (log warning for analytics).

---

#### 2. Create Payment Method (POST /users/me/payment-methods)
```
POST /users/me/payment-methods
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "type": "bank",
  "label": "BCA Utama",
  "account_number": "1234567890",
  "holder_name": "Ricky Felix",
  "phone": null,
  "qris_image_path": null,
  "is_primary": false
}

Response 201:
{
  "id": "pm_abc123",
  "type": "bank",
  "label": "BCA Utama",
  "account_number": "1234567890",
  "holder_name": "Ricky Felix",
  "phone": null,
  "qris_image_path": null,
  "is_primary": false,
  "created_at": "2026-06-08T10:00:00Z",
  "updated_at": "2026-06-08T10:00:00Z"
}

Response 400: Validation error
{
  "statusCode": 400,
  "message": "account_number must be numeric",
  "error": "Bad Request"
}
```

**Validation (Server-side, in NestJS DTO):**
```typescript
export class CreatePaymentMethodDto {
  @IsEnum(['bank', 'gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'qris'])
  type: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  label: string;

  @IsOptional()
  @Matches(/^\d{6,20}$/, { message: 'account_number must be 6-20 digits' })
  account_number?: string;

  @IsOptional()
  @MaxLength(50)
  holder_name?: string;

  @IsOptional()
  @Matches(/^(\d{8,15}|^62\d{8,14})$/, { message: 'phone must be 8-15 digits, optionally starting with 62 or 0' })
  phone?: string;

  @IsOptional()
  @IsString()
  qris_image_path?: string;  // e.g. "users/uuid/qris/image.jpg"

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  // Conditional: if type is 'bank', require account_number & holder_name.
  // if type is e-wallet, require phone.
  // if type is 'qris', both can be optional (image is the key).
}
```

**Logic:**
- Generate `id = uuid()` server-side.
- If `is_primary: true`, update all other methods to `is_primary: false`.
- Append new method to `users.payment_methods` JSONB array.
- Return the new object with `created_at` & `updated_at` timestamps.

---

#### 3. Update Payment Method (PUT /users/me/payment-methods/{id})
```
PUT /users/me/payment-methods/{id}
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "label": "BCA Savings",
  "account_number": "9876543210",
  "holder_name": "Ricky Padang",
  "is_primary": false
}

Response 200: Updated method object
```

**Logic:**
- Find method with matching `id` in `users.payment_methods` array.
- If `id` not found, return 404.
- Update fields; set `updated_at = NOW()`.
- If `is_primary: true`, demote others.
- Persist and return updated object.

---

#### 4. Delete Payment Method (DELETE /users/me/payment-methods/{id})
```
DELETE /users/me/payment-methods/{id}
Authorization: Bearer <JWT>

Response 204: No content
```

**Logic:**
- Find and remove method with matching `id`.
- If it was `is_primary: true`, promote the oldest remaining to primary (or leave empty if none left).
- If `qris_image_path` exists, optionally delete the file from storage (deferred for MVP if complex).
- Persist and return 204.

---

#### 5. Get User's Payment Methods (For Other Members) (GET /users/{userId}/payment-methods)
**Purpose**: Retrieve a peer's payment methods when viewing the settlement/pay flow.

```
GET /users/{userId}/payment-methods
Authorization: Bearer <JWT>

Response 200:
{
  "data": [
    {
      "id": "pm_abc123",
      "type": "bank",
      "label": "BCA Utama",
      "account_number": "1234567890",  -- MASKED: last 4 digits only ("••••7890")
      "holder_name": "Ricky Felix",
      "is_primary": true,
      "created_at": "2026-06-08T10:00:00Z"
    }
  ]
}
```

**RLS Guard**: User can fetch `userId`'s methods only if both are co-members of at least one group (see section 8).

**Masking**: Account numbers exposed only as last-4 mask (e.g., `••••7890`) to limit exposure; phone numbers masked as `••••6789`.

---

### Controller Decorator Pattern (NestJS)
```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(AuthGuard)
export class PaymentMethodsController {
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  @Get('me/payment-methods')
  listMy(@CurrentUser() user: AuthUser) {
    return this.paymentMethodsService.listForUser(user.id);
  }

  @Post('me/payment-methods')
  create(
    @Body() dto: CreatePaymentMethodDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentMethodsService.create(user.id, dto);
  }

  @Put('me/payment-methods/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentMethodsService.update(user.id, id, dto);
  }

  @Delete('me/payment-methods/:id')
  delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentMethodsService.delete(user.id, id);
  }

  @Get(':userId/payment-methods')
  listOther(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthUser,
  ) {
    // RLS: user must be co-member of userId
    return this.paymentMethodsService.listForUser(userId, {
      maskSensitive: true,
      requesterUserId: user.id,
    });
  }
}
```

---

## 7. Frontend & UX

### Updated MetodePembayaran.jsx

**Current state**: Toggle list of method IDs.  
**New state**: Full details form for each method, with add/edit/delete actions.

**Layout:**
```
┌─ ScreenHeader: "Metode Pembayaran" + [Save] button ────────────────────┐
├──────────────────────────────────────────────────────────────────────────┤
│ Cara kamu menerima pembayaran...                                         │
│                                                                          │
│ ┌─ Saved Methods List ───────────────────────────────────────────────┐  │
│ │ ☆ BCA Utama — ••••7890 (primary badge)        [edit] [delete]    │  │
│ │ ○ GoPay — ••••6789                            [edit] [delete]    │  │
│ │                                                                   │  │
│ │ [+ Tambah Metode Pembayaran]                                    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ ⓘ Arisan Digital tidak menyimpan uang...                              │
└──────────────────────────────────────────────────────────────────────────┘
```

**Modal/Sheet for Add/Edit:**
```
┌─ "Tambah Metode Pembayaran" ─────────────────────────────────────┐
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Jenis Pembayaran                                               │
│ [Bank]  [E-Wallet]  [QRIS]                                    │
│                                                                 │
│ Label (Nama)*                                                  │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ BCA Utama                                                │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ [Conditional: Bank] Account Number*                           │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 1234567890                                               │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ [Conditional: Bank] Account Holder Name*                      │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Ricky Felix                                              │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ [Conditional: E-Wallet] Phone Number*                         │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ +62 812 3456 789                                         │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ [Conditional: QRIS] Upload QRIS Image                         │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ [+ Tambah Gambar QRIS]  (optional)                       │  │
│ │ Max 5 MB, JPG/PNG                                        │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ ☐ Jadikan Metode Utama                                        │
│                                                                 │
│                                [Batal]    [Simpan]            │
└──────────────────────────────────────────────────────────────┘
```

**Component Structure:**
```
pages/application/v2/MetodePembayaran.jsx
├─ ScreenHeader
├─ MethodsList (displays saved methods, each with edit/delete)
├─ MethodForm (reusable for add & edit)
└─ ConfirmDeleteModal
```

**Component Files:**
- `frontend/src/pages/application/v2/MetodePembayaran.jsx` — main page (refactored).
- `frontend/src/components/application/v2/metodePembayaran/MethodCard.jsx` — card showing a single method.
- `frontend/src/components/application/v2/metodePembayaran/MethodForm.jsx` — form for add/edit, handles conditional fields by type.
- `frontend/src/components/application/v2/metodePembayaran/DeleteConfirmModal.jsx` — confirmation dialog.
- Static data: `frontend/src/components/application/v2/metodePembayaran/data.jsx` — `PAYMENT_METHODS` array (same as v0, but now only metadata).

**Key Frontend Logic:**
- Load methods on mount via `usersService.listPaymentMethods()`.
- Form state: selected type determines which fields are shown (conditional rendering).
- QRIS image upload: use `useUpload({ bucket: "payment-qris-codes" })` before form submission.
- Validation: front-end checks for numeric account number, phone format; back-end validates again.
- Error handling: inline error messages under each field; toast for success/server errors.

---

### Integration: Payment Method Selection in Settlement Flow

**New flow (Settlement Initiation → Pay):**
```
Dompet/Bill Detail (Patungan)
         ↓
    [Pay Now] button
         ↓
    Amount Confirmation (qty + exchange if needed)
         ↓
    [NEW] Confirm Payment Method Sheet (see payee's methods, pick one)
         ↓
    BuktiTransfer (receipt shows selected method; user uploads proof)
         ↓
    Settlement Created + Group Notified
```

**New Component: PaymentMethodSelector.jsx**
```typescript
/**
 * Sheet showing payee's payment methods + selection UX
 * Surfaces: method type (icon), label, last-4 mask, primary indicator.
 * If payee has no methods: show "belum lengkapi" message + dismiss button.
 * If error loading: toast + allow manual entry (future v2).
 */
function PaymentMethodSelector({ payeeUserId, onSelect, onCancel }) {
  const [methods, setMethods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersService.getPaymentMethods(payeeUserId).then(setMethods).catch(err => {
      console.error('Failed to load methods:', err);
      toast('Gagal memuat metode pembayaran', 'error');
    }).finally(() => setLoading(false));
  }, [payeeUserId]);

  const handleConfirm = () => {
    if (!selected) {
      toast('Pilih metode pembayaran', 'error');
      return;
    }
    onSelect(selected);
  };

  return (
    <Sheet onDismiss={onCancel}>
      {loading ? (
        <LoadingSpinner />
      ) : methods.length === 0 ? (
        <EmptyState message="Penerima belum lengkapi metode pembayaran. Tanyakan langsung untuk konfirmasi rekening." />
      ) : (
        <>
          <h2>Pilih Metode Pembayaran Penerima</h2>
          <MethodList>
            {methods.map(m => (
              <MethodCard
                key={m.id}
                method={m}
                selected={selected?.id === m.id}
                onSelect={() => setSelected(m)}
              />
            ))}
          </MethodList>
          <Button onClick={handleConfirm}>Lanjutkan</Button>
        </>
      )}
    </Sheet>
  );
}
```

**Passing to BuktiTransfer:**
From the payment-method-selector sheet, pass selected method ID as a query param:
```javascript
navigate(`/app/bukti-transfer?type=${isArisan ? 'arisan' : 'patungan'}&roundId=...&selectedMethodId=${selectedMethod.id}`);
```

**BuktiTransfer.jsx updates:**
- Parse `selectedMethodId` from query params.
- Fetch method details (from `users/{payeeUserId}/payment-methods/{methodId}`) or embed in the payment object.
- Display in receipt area: "Metode Pembayaran: BCA Utama (••••7890)" under the amount.
- User uploads proof as before; settlement references the chosen method (optional: store method ID on the settlement record for audit).

---

### Validation & Error States

**Form Validation:**
- Empty state: "Belum ada metode pembayaran. Tambahkan satu untuk memudahkan pembayaran dari anggota grup."
- Loading state: Skeleton cards or spinner during initial load.
- Error state: Toast message + retry button.
- Inline field errors: Red text below field, e.g., "Nomor rekening harus angka (6-20 digit)."
- Success: Toast "Metode pembayaran disimpan ✓" after save.

**v2 Design System Adherence:**
- Color: Use `--lavender` (patungan-associated; payment is part of settlement/patungan flow) for primary actions.
- Icons: Reuse existing icons from `icons.jsx`; add a few if needed (bank icon, wallet icon, QR icon).
- Spacing: `px-5` mobile, `px-6` tablet, consistent with other screens.
- Modal/sheet: Use standard bottom-sheet or center modal from the design system (check existing usage in `PaySheet.jsx`, `ComposeSheet.jsx`).
- Typography: Headings use `.h-5` / `.text-[15px]` semibold; labels use `.text-[13px]` medium.

---

## 8. Edge Cases, Privacy & Security

### Who Can See Whose Payment Methods?

**Policy:**
- **Owner**: Can see their own payment methods in full (account numbers, phone, etc.).
- **Group Co-members**: Can see a group member's payment methods **only if both are in the same group** (via `group_members` table join). Sensitive fields (account number, phone) are **masked** (last 4 digits only).
- **Non-group members**: Cannot see any payment methods (403 Forbidden).
- **Super Admin**: Can see all payment methods (platform-wide).

**RLS Policy (Supabase):**
```sql
-- Permission: users can SELECT their own payment_methods in full
-- + can SELECT others' payment_methods if they share a group + fields are masked
CREATE POLICY "users_read_own_payment_methods"
  ON users
  FOR SELECT
  USING (
    auth.uid() = id  -- own row
    OR
    -- OR co-member in at least one group
    EXISTS (
      SELECT 1 FROM group_members gm1
      WHERE gm1.user_id = auth.uid()
      INTERSECT
      SELECT 1 FROM group_members gm2
      WHERE gm2.user_id = id
    )
    OR
    -- OR super_admin
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND platform_role = 'super_admin'
    )
  );
```

**Backend Masking (in PaymentMethodsService.listForUser):**
```typescript
listForUser(userId: string, opts?: { maskSensitive?: boolean; requesterUserId?: string }) {
  // Fetch user's payment_methods JSONB
  const methods = /* ... */;
  
  // If maskSensitive && requesterUserId !== userId (fetching someone else's methods):
  if (opts?.maskSensitive && opts.requesterUserId !== userId) {
    return methods.map(m => ({
      ...m,
      account_number: m.account_number ? `••••${m.account_number.slice(-4)}` : null,
      phone: m.phone ? `••••${m.phone.slice(-4)}` : null,
      // holder_name is kept in full (no masking for bank account holder name, as it's needed for confirmation)
    }));
  }
  return methods;
}
```

---

### Storage & Image Privacy

**QRIS Images:**
- Stored in private bucket `payment-qris-codes` (not public).
- Path format: `users/{userId}/qris/{methodId}.{jpg|png}`.
- Access: Only the owner can fetch signed read URLs for their own images. Backend validates ownership before issuing signed URL.
- Expiry: Signed URLs expire in 1 hour (configurable); paths are durable.
- Frontend resolves fresh signed URL on each render (or caches with a short TTL).

**No Sensitive Data in Public Bundle:**
- Do not bundle account numbers, phone numbers, or QRIS images in the client bundle.
- All sensitive fields fetched from `/users/{id}/payment-methods` endpoint on demand.
- Client stores method data only in component state or session storage (not localStorage).

---

### Data Retention & Deletion

**User deletes a payment method:**
- Method removed from `users.payment_methods` JSONB array.
- If QRIS image exists, optionally delete file from storage (can be deferred to async job or manual admin task).

**User deletes their account:**
- `auth.users` delete cascades to `public.users` (RLS + trigger).
- QRIS images in storage: Manual cleanup or automatic via storage policies (if implemented).

**Future: Compliance requirements** (GDPR, right-to-be-forgotten)
- Currently out of scope; no audit log or soft-delete.
- If needed, add a `deleted_at` column and RLS policy to exclude deleted rows.

---

## ⚖️ Regulatory & Compliance Constraints (MUST READ before building)

> Jurisdiction: Indonesia (Bank Indonesia + OJK). This is product guidance, **not legal advice** — get an Indonesian fintech lawyer to review before any funds-holding feature ships.

### Core principle: this feature is a **directory, not a payment processor**
Users enter **their own** account details; other members pay them **directly, peer-to-peer**, through their own existing banking/e-wallet apps. Arisan Digital never touches the money. As long as that stays true, **no permission, partnership, or license is required** from banks, e-wallets, or regulators to build this feature. It is legally equivalent to a person sharing their own account number.

### Hard rules the implementation MUST follow

| Rule | Why |
|---|---|
| **Never hold, route, escrow, or process user funds.** No wallet balance, no "pay through the app" button, no money passing through any company-controlled account (incl. the arisan pot). | The moment funds flow *through* the platform it becomes a **Payment Service Provider (PJP)** under Bank Indonesia (PBI 22/23/PBI/2020) and requires a license. This is the single most important line. |
| **QRIS: display user-uploaded images ONLY.** Never *generate* QRIS codes or *process/aggregate* QRIS payments. | Generating/processing QRIS requires being a licensed BI payment provider. Showing an image a user uploaded is just displaying their own content. |
| **Use bank/e-wallet names as TEXT labels, not logos/brand assets.** Keep the current text-chip approach. | Logos are trademarks; reuse needs each brand's permission/guidelines. Descriptive text use ("BCA", "GoPay") is low-risk. |
| **Do NOT route member-to-member payments through Xendit/Midtrans.** The existing gateway integration is ONLY for the app's own subscription revenue (app = merchant). | Routing third-party P2P funds through a gateway re-enters PJP/escrow territory. |

### Data-protection obligations (these DO apply — but are not "permission")
Account numbers + holder names are personal/financial data under Indonesia's **Personal Data Protection Law (UU No. 27/2022 / PDP)**. The build must:
- Obtain **clear consent / purpose limitation** — collected solely to let group co-members pay the user.
- **Minimize exposure:** account numbers masked to last-4 for peers (per Section 8 RLS); full value visible only to the owner.
- **Store QRIS images in a PRIVATE bucket** (signed-URL access only); never a public bucket.
- **Never ship account data in the public client bundle** (no secrets/full numbers inlined; data fetched per-request, group-scoped).

### Arisan-specific sensitivity
"Arisan online" has a history of fraud/Ponzi scrutiny in Indonesia. Keeping the platform **pure coordination (never holding the pot)** is precisely what keeps it outside OJK/BI fund-management oversight. Any future feature that pools or holds money must be treated as a new regulated product, not an iteration of this one.

### Developer checklist (gate before merge)
- [ ] No code path holds, transfers, or escrows user funds.
- [ ] QRIS is upload-and-display only; no generation/processing libraries added.
- [ ] UI uses text labels for banks/e-wallets; no logo image assets bundled.
- [ ] Account numbers masked to last-4 for non-owner viewers; full value owner-only.
- [ ] QRIS images stored in a private bucket via signed URLs.
- [ ] Consent copy present on the Metode Pembayaran screen explaining why details are collected and who can see them.

---

## 9. Phasing & Milestones

### Phase 1: Schema & Backend API (Sprint 1–2)
**Goal**: Implement data model + CRUD endpoints; unblock frontend.

**Deliverables:**
- [x] `payment_method_details JSONB` schema + migration (idempotent).
- [x] Backend DTOs: `CreatePaymentMethodDto`, `UpdatePaymentMethodDto`.
- [x] Service methods: `listForUser`, `create`, `update`, `delete`.
- [x] Controllers: `POST/PUT/DELETE /users/me/payment-methods`, `GET /users/{id}/payment-methods`.
- [x] Validation: account number numeric, phone format, conditional required fields.
- [x] RLS policies: read access for group co-members, masking.
- [x] Test: Unit tests for service, integration tests for endpoints (Postman/Jest).
- [x] No image upload yet; `qris_image_path` accepted but null.

**Definition of Done:**
- All endpoints return correct shapes per spec.
- Validation rejects bad input (non-numeric account, bad phone).
- RLS blocks non-group members.
- Masking works (account numbers last-4 only for others).
- Tests pass.

---

### Phase 2: Frontend Form & Management (Sprint 2–3)
**Goal**: Build the MetodePembayaran.jsx page with add/edit/delete forms.

**Deliverables:**
- [x] Refactor `MetodePembayaran.jsx` to display saved methods.
- [x] Modal form for add/edit, with conditional fields (bank vs. e-wallet vs. QRIS).
- [x] Delete confirmation modal.
- [x] Primary/default method selection (radio).
- [x] Client-side validation (account number, phone, label).
- [x] Load/save/error states.
- [x] v2 design system adherence (colors, spacing, typography).
- [x] ~~QRIS image upload~~ (deferred to Phase 4).
- [x] Backward-compatibility detection: show migration banner if legacy format detected.

**Test:**
- Manual: add/edit/delete methods; verify persistence via GET /users/me.
- E2E: flow from MetodePembayaran add → save → list.

---

### Phase 3: Integration to Settlement Flow (Sprint 3–4)
**Goal**: Surface payment methods during patungan/arisan settlement, unblock payer from paying without asking.

**Deliverables:**
- [x] New `PaymentMethodSelector.jsx` component (sheet/modal).
- [x] Fetch payee's methods via `GET /users/{id}/payment-methods` (with masking).
- [x] Display method cards (type icon, label, last-4 mask, primary indicator, QRIS thumbnail if available).
- [x] Selection + pass to BuktiTransfer as query param.
- [x] `BuktiTransfer.jsx` displays selected method (reference, in receipt area).
- [x] Edge case: payee has no methods → show helpful message + allow dismiss.
- [x] Update settlement flows (patungan & arisan) to show method selector before proof upload.

**Test:**
- Manual: as payer, initiate settlement → see payee's methods → select one → method shown on receipt → upload proof.
- Check query params passed correctly between screens.

---

### Phase 4: QRIS Image Upload (Sprint 4, or later if deprioritized)
**Goal**: Allow QRIS code images; surface in settlement flow.

**Deliverables:**
- [x] Form update: file input for QRIS image in MethodForm.
- [x] Use `useUpload` + `POST /storage/upload-url` + signed upload to `payment-qris-codes` bucket.
- [x] Show local preview, "Ganti foto" button, "Siap dikirim" checkmark.
- [x] Include `qris_image_path` in POST/PUT payment-methods API calls.
- [x] PaymentMethodSelector: display QRIS thumbnail (fetch signed URL from `GET /storage/read-url`).
- [x] BuktiTransfer: show QRIS image under selected method (optional, for reference).

**Test:**
- Manual: add payment method with QRIS image → check image in list → check image in settlement flow.
- Verify signed URLs expire and are refreshed on render.

---

### Phase 5: Refinement & Analytics (Sprint 5+)
**Goal**: Optimize UX based on feedback; monitor success metrics.

**Deliverables:**
- [x] Usability testing: do users understand how to add/edit methods? Friction points?
- [x] Analytics: track "methods added", "methods per user", "method selection in settlement" events.
- [x] Feedback: integrate feedback from groups using the feature (via in-app surveys or support channels).
- [x] Improvements: e.g., copy clarification, form field order, validation messages.

---

### Dependency Chain
```
Phase 1 (Schema + API) ─┐
                         ├─→ Phase 2 (Frontend Form)
                         │
                         └─→ Phase 3 (Settlement Integration) ─┐
                                                                ├─→ Phase 4 (QRIS Upload)
                                                                │
                                                                └─→ Phase 5 (Analytics & Refinement)
```

---

## 10. Open Questions & Decisions Needed from Owner

1. **QRIS Image Storage**: Should QRIS images be stored in a new bucket (`payment-qris-codes`) or reuse the existing `payment-proofs` bucket? New bucket keeps concerns separate; reuse saves storage costs.
   - **Recommendation**: New bucket (`payment-qris-codes`), private, auto-expire after 90 days (or never—user-owned images). Keeps payment-proof (settlement evidence) separate from payment account (setup data).

2. **Account Number Exposure**: Currently, we show last-4 digits to group co-members. Is this sensitive enough, or should we hide even more (e.g., only show the method label + type icon, no digits)?
   - **Recommendation**: Last-4 is reasonable; it's enough for user confirmation ("yes, that's my BCA ending in 7890") without exposing the full account. Bank apps use similar patterns.

3. **Bank Account Validation**: Should we validate account numbers against real bank APIs (e.g., bank name lookup), or trust user input?
   - **Recommendation**: Trust user input for MVP (no bank API integration). Validation happens at settlement time when user proves receipt (social proof). Can add bank API validation in future if needed.

4. **Multiple QRIS Codes**: Can a user upload multiple QRIS images (one per method), or just one global QRIS?
   - **Recommendation**: One QRIS per method (stored on each `payment_method` object as `qris_image_path`). Allows flexibility: e.g., separate QRIS for personal vs. business account.

5. **E-Wallet Phone Number Format**: Should we normalize phone numbers (strip +62, leading 0, etc.) on input, or store as-is?
   - **Recommendation**: Store as-is (user's preference); show hints during input ("e.g., +62 812 3456 789 or 0812 3456 789"). Backend strips + and validates digit count.

6. **Primary Method Visibility**: When a payee has multiple methods, should we auto-select the "primary" one in the settlement sheet, or force the payer to choose?
   - **Recommendation**: Auto-select the primary one; allow payer to switch if desired. Reduces friction for most cases; flexibility for edge cases.

7. **Method Deletion & Stored References**: If a user deletes a payment method, but an old settlement record still references it by ID, should we cascade-delete the settlement record or orphan it?
   - **Recommendation**: Orphan it (don't cascade). Settlement records are historical and should not be modified. The settled payment already went through; method deletion is just a forward-facing change.

8. **Legacy Data Migration Timeline**: How long should we support the v0 format (`string[]` method IDs) before forcing a migration?
   - **Recommendation**: Soft-migrate on first edit (show banner + help user fill in details). Hard cutoff not needed; v1 code can auto-convert v0 on read.

9. **Group-Level Payment Policies** (future consideration): Should group admins be able to enforce that all members add payment methods before joining, or mandate QRIS-only?
   - **Recommendation**: Out of scope for MVP. Flag as a future feature if requested.

10. **Payment Proof Images & Method Linking**: When a user uploads a payment proof in BuktiTransfer, should the proof be linked to the method they selected, or stored separately?
    - **Recommendation**: Store separately in `payment-proofs` bucket (current pattern). Settlement record stores both `proof_url` (evidence) and `selected_method_id` (reference). Keeps concerns clean.

---

## 11. Success Criteria & Launch Readiness

### Go-to-Launch Checklist

- [ ] **Data Model**: `payment_method_details` JSONB in `users.payment_methods`; backward-compatible migration; no data loss on upgrade.
- [ ] **Backend API**: All 5 endpoints implemented, tested, validated, RLS policies in place.
- [ ] **Frontend Form**: MetodePembayaran.jsx refactored; add/edit/delete flows work; validation in place.
- [ ] **Settlement Integration**: PaymentMethodSelector sheet displays in patungan & arisan flows; selected method shows in BuktiTransfer.
- [ ] **RLS & Privacy**: Payment methods readable by group co-members (masking applied); writable by owner only.
- [ ] **Error Handling**: Graceful errors on API failure; helpful toast messages; retry options.
- [ ] **Testing**: Unit tests (service methods), integration tests (endpoints), E2E (user flows).
- [ ] **Documentation**: Endpoint docs (Swagger/OpenAPI), frontend component stories, RLS policy comments.
- [ ] **Monitoring**: Analytics events for "method added", "method selected in settlement", etc.
- [ ] **Soft Launch**: Deploy to staging; test with internal users; gather feedback.
- [ ] **Production Launch**: Roll out to all users; monitor error rates and success metrics.

---

## 12. Appendix: API Request / Response Examples

### Example: Create Bank Account Method
**Request:**
```bash
curl -X POST https://api.arisandigital.app/users/me/payment-methods \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bca",
    "label": "BCA Utama",
    "account_number": "1234567890",
    "holder_name": "Ricky Felix",
    "is_primary": true
  }'
```

**Response (201 Created):**
```json
{
  "id": "pm_550e8400-e29b-41d4-a716-446655440000",
  "type": "bca",
  "label": "BCA Utama",
  "account_number": "1234567890",
  "holder_name": "Ricky Felix",
  "phone": null,
  "qris_image_path": null,
  "is_primary": true,
  "created_at": "2026-06-08T10:00:00.000Z",
  "updated_at": "2026-06-08T10:00:00.000Z"
}
```

---

### Example: List User's Payment Methods (Own)
**Request:**
```bash
curl -X GET https://api.arisandigital.app/users/me/payment-methods \
  -H "Authorization: Bearer <JWT>"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "pm_550e8400-e29b-41d4-a716-446655440000",
      "type": "bca",
      "label": "BCA Utama",
      "account_number": "1234567890",
      "holder_name": "Ricky Felix",
      "phone": null,
      "qris_image_path": null,
      "is_primary": true,
      "created_at": "2026-06-08T10:00:00.000Z",
      "updated_at": "2026-06-08T10:00:00.000Z"
    },
    {
      "id": "pm_660f9511-f40c-52e5-b827-557766551111",
      "type": "gopay",
      "label": "GoPay",
      "account_number": null,
      "holder_name": null,
      "phone": "628123456789",
      "qris_image_path": null,
      "is_primary": false,
      "created_at": "2026-06-08T10:05:00.000Z",
      "updated_at": "2026-06-08T10:05:00.000Z"
    }
  ]
}
```

---

### Example: List Another User's Payment Methods (Masked)
**Request:**
```bash
curl -X GET https://api.arisandigital.app/users/8f2e3c7a-9b1d-4e5f-8g6h-i9j0k1l2m3n4/payment-methods \
  -H "Authorization: Bearer <JWT>"
```

**Response (200 OK, fields masked):**
```json
{
  "data": [
    {
      "id": "pm_550e8400-e29b-41d4-a716-446655440000",
      "type": "bca",
      "label": "BCA Utama",
      "account_number": "••••7890",
      "holder_name": "Ricky Felix",
      "phone": null,
      "qris_image_path": null,
      "is_primary": true,
      "created_at": "2026-06-08T10:00:00.000Z"
    }
  ]
}
```

---

### Example: Update Payment Method
**Request:**
```bash
curl -X PUT https://api.arisandigital.app/users/me/payment-methods/pm_550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "BCA Savings",
    "account_number": "9876543210",
    "holder_name": "Ricky Padang",
    "is_primary": false
  }'
```

**Response (200 OK):**
```json
{
  "id": "pm_550e8400-e29b-41d4-a716-446655440000",
  "type": "bca",
  "label": "BCA Savings",
  "account_number": "9876543210",
  "holder_name": "Ricky Padang",
  "phone": null,
  "qris_image_path": null,
  "is_primary": false,
  "created_at": "2026-06-08T10:00:00.000Z",
  "updated_at": "2026-06-08T10:15:00.000Z"
}
```

---

### Example: Delete Payment Method
**Request:**
```bash
curl -X DELETE https://api.arisandigital.app/users/me/payment-methods/pm_550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <JWT>"
```

**Response (204 No Content):**
```
(empty body)
```

---

## End of PRD

**File Location**: `/Users/rickyfelix/GitHub/Arisan-Digital/PRD-payment-methods.md`  
**Audience**: Developer subagent, product owner, QA.  
**Status**: Ready for implementation sprint planning.

For questions or clarifications, refer to the **Open Questions** section (10) or reach out to the product owner.
