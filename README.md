# 🎉 Arisan Digital

Aplikasi web modern untuk mendigitalisasi sistem arisan tradisional Indonesia, plus pembagian tagihan (patungan) bareng teman — dirancang khusus untuk pengguna Gen Z.

## 🌟 Fitur Utama

### 👥 Arisan (Grup)
- Buat grup arisan dengan jumlah ronde, jadwal mingguan/bulanan, dan nominal iuran
- Pilih giliran secara **acak otomatis** atau **manual** (drag & drop)
- Manajemen anggota: undang via tautan token (shareable link), tetapkan admin per grup
- Verifikasi pembayaran iuran oleh admin (approve / reject + alasan)
- Auto-scaffolding ronde berdasarkan tanggal mulai + frekuensi
- Status grup: `active` | `completed` | `pending`

### 💸 Patungan (Bill Splitting)
- Bagi tagihan rame-rame: makan, transport, akomodasi, utilitas, hiburan, dll
- 4 metode pembagian: **equal**, **exact**, **percentage**, **shares**
- Tagihan berulang (`recurring_bills`): sewa, langganan, listrik bulanan
- **Penyederhanaan utang** (debt simplification): algoritma greedy min-cash-flow biar A→B→C jadi A→C
- Settlement: pelunasan + bukti transfer + konfirmasi penerima
- Threaded comments per tagihan
- Kontak yang sering dipakai (saved contacts dengan auto-resolve dari nomor HP)

### 🔔 Notifikasi
Tipe notifikasi: `payment_due`, `payment_confirmed`, `payment_rejected`, `giliran_announced`, `member_joined`, `round_completed`, `bill_created`, `bill_settled`, `bill_reminder`, `settlement_confirmed`, `settlement_rejected`.

### 💳 Monetisasi
- 3 paket: **Gratis** (max 2 grup, 5 tagihan/bulan), **Boss** (Rp 29.000/bln), **Bisnis** (Rp 199.000/bln)
- Subscription per-user atau per-grup (admin nanggung)
- Integrasi gateway: **Xendit** dan **Midtrans** (webhook signature validation)
- Audit trail penuh di `payment_transactions`
- Quota enforcement via `PlanGuard` + `usage_tracking`

## 🛠️ Tech Stack

**Backend** (`backend/`)
- NestJS 10 + TypeScript (strict)
- `@supabase/supabase-js` dengan service role key (RLS sebagai safety net)
- class-validator + class-transformer untuk validasi DTO
- Jest untuk unit test (49 test, 8 suite)

**Frontend** (`frontend/`)
- Vite + React 18 + JSX
- Tailwind CSS v4 + Relume UI
- React Router 7 + Framer Motion
- Supabase JS untuk auth + storage upload

**Database**
- Supabase PostgreSQL (schema v3 di `supabase/schema.sql`)
- 20 tabel: users, groups, group_members, rounds, payments, notifications, bills, bill_participants, bill_splits, bill_settlements, invite_links, user_contacts, bill_comments, recurring_bills, debt_simplifications, plans, user_subscriptions, group_subscriptions, payment_transactions, usage_tracking
- Row Level Security aktif di semua tabel; helper function `is_super_admin()` dan `is_group_admin(group_id)`

## 🏗️ Arsitektur

```
Browser  ─┐
          ├─► Vite/React frontend  ◄──── Supabase Storage (signed upload URL)
          │       │ JWT
          │       ▼
          └─► NestJS backend (service role) ──► Supabase PostgreSQL
                  ▲
                  └── Xendit / Midtrans webhook
```

- Browser pakai **anon key** hanya untuk upload langsung ke Storage.
- Semua mutasi data lewat **NestJS** yang authenticate JWT-nya pakai Supabase Auth.
- NestJS pakai **service role key** (bypass RLS) — RLS jadi defense-in-depth, bukan auth utama.

## 🚀 Getting Started

### Prasyarat
- Node.js 20+
- Akun Supabase (project + service role key)
- Akun Xendit dan/atau Midtrans (opsional, untuk billing)

### 1. Install semua dependencies sekaligus
```bash
npm run install:all
```

### 2. Setup environment

**`backend/.env`** (copy dari `backend/.env.example`):
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=http://localhost:5173
PORT=3000

# Opsional: webhook secrets
XENDIT_WEBHOOK_TOKEN=...
MIDTRANS_SERVER_KEY=...
```

**`frontend/.env`**:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3000/api
```

### 3. Setup database
Paste isi `supabase/schema.sql` ke Supabase SQL Editor dan jalankan. Bila perlu reset, pakai `supabase/schema-delete.sql` dulu (hati-hati — destructive).

### 4. Buat Supabase Storage buckets (private)
- `avatars`
- `receipts`
- `payment-proofs`

### 5. Jalankan dev server
```bash
# frontend + backend bareng (concurrently)
npm run dev

# atau pisah
npm run frontend    # http://localhost:5173
npm run backend     # http://localhost:3000/api
```

## 🧪 Testing

```bash
# Backend
npm test --prefix backend          # jest (8 suite, 49 test)
npm run lint --prefix backend      # eslint
npm run build --prefix backend     # tsc/nest build

# Frontend
npm run lint --prefix frontend
npm run build --prefix frontend

# Keduanya
npm run lint
```

Coverage saat ini fokus di logika bisnis: split strategies (equal/exact/percentage/shares), debt simplification algorithm, AuthGuard / RolesGuard / PlanGuard, GroupsService (round scaffolding + admin check), ContactsService (touch idempotency).

## 📁 Struktur Proyek

```
Arisan-Digital/
├── backend/                     # NestJS API (port 3000)
│   └── src/
│       ├── common/              # guards (Auth, Roles, Plan), decorators, types
│       ├── supabase/            # SupabaseService (service role client)
│       ├── users/
│       ├── groups/              # arisan core
│       ├── group-members/
│       ├── rounds/
│       ├── payments/            # iuran (arisan)
│       ├── invite-links/
│       ├── notifications/
│       ├── bills/               # patungan + 4 split strategies
│       ├── bill-participants/
│       ├── bill-settlements/
│       ├── bill-comments/
│       ├── recurring-bills/
│       ├── debt-simplifications/
│       ├── plans/               # monetization
│       ├── subscriptions/
│       ├── payment-transactions/
│       ├── billing/             # Xendit + Midtrans webhooks
│       ├── usage/
│       ├── contacts/
│       └── storage/             # signed upload/read URL
│
├── frontend/                    # Vite + React (port 5173)
│   └── src/
│       ├── pages/               # LandingPage, LoginOrRegister, application/
│       │   └── application/     # AppHomepage, ArisanPage, PatunganPage, BayarPage, ProfilPage
│       ├── components/
│       ├── context/
│       ├── services/            # API client modules (see services/README.md)
│       ├── hooks/
│       ├── lib/                 # supabase client, api fetch wrapper
│       ├── data/                # mock fixtures
│       ├── utils/
│       └── assets/
│
├── supabase/
│   ├── schema.sql               # v3 — single source of truth
│   └── schema-delete.sql        # reset helper
│
└── package.json                 # root scripts: dev, install:all, lint, build
```

## 🔐 RBAC

Dua tingkat role:

| Role | Field | Hak |
|---|---|---|
| `platform_role` | `users.platform_role` | `user` (default) atau `super_admin` (lihat semua grup/tagihan/analytics) |
| `group_role` | `group_members.group_role` | `member` atau `admin` (konfirmasi pembayaran, edit grup, kelola anggota) |

- NestJS `@Roles('super_admin')` + `RolesGuard` cek `platform_role`.
- Helper `assertGroupAdmin(groupId, userId)` cek `groups.admin_id` ATAU `group_members.group_role='admin'`.
- `@RequirePlan('groups' | 'bills')` + `PlanGuard` cek kuota free tier via `usage_tracking`.

## 🎯 Format Indonesia

- **Mata Uang**: `Rp 100.000` (titik sebagai pemisah ribuan, disimpan sebagai `BIGINT` di IDR — no decimals)
- **Nomor HP**: `+62 812-3456-7890`
- **Tanggal**: `8 Januari 2026`
- **Bahasa default**: `id` (English juga didukung lewat `users.language`)

## 🔒 Security Checklist

- ✅ Row Level Security aktif di semua tabel
- ✅ Service role key tidak pernah keluar dari backend
- ✅ JWT verification di setiap request (AuthGuard)
- ✅ Webhook signature validation (Xendit token, Midtrans sha512)
- ✅ DTO validation dengan class-validator
- ✅ Storage path ownership check (path harus diawali `userId/`)
- ✅ Plan limit enforcement sebelum create (PlanGuard)

## 📝 License

Proprietary — Titik Jalin Projects

---

**Dibuat dengan ❤️ untuk Gen Z Indonesia** 🇮🇩
