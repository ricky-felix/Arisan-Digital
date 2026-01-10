# 🎉 Arisan Digital - Gen Z Prototype

Aplikasi web modern untuk mendigitalisasi sistem arisan tradisional Indonesia, dirancang khusus untuk pengguna Gen Z.

## 🌟 Fitur Utama

### ✅ Autentikasi
- Login dengan nomor telepon + OTP via Supabase Auth
- Verifikasi 6-digit OTP
- Setup profil awal dengan foto profil
- Session management otomatis
- Protected routes dengan middleware

### ✅ Dashboard
- Statistik ringkasan (total kontribusi, arisan aktif, pembayaran berikutnya)
- Daftar grup arisan dengan filter (Aktif, Selesai)
- Navigasi bottom bar (mobile) dan sidebar (desktop)
- Header dengan notifikasi dan profil user
- Loading states dan skeleton loaders

### ✅ Manajemen Grup
- **Buat Arisan Baru**: Wizard multi-step dengan validasi
- **Detail Grup**: Halaman lengkap dengan tabs (Ringkasan, Anggota, Ronde, Pengaturan)
- **Kartu Grup**: Tampilan ringkas dengan avatar anggota dan status

### ✅ Pembayaran & Ronde
- **Submit Pembayaran**: Upload bukti transfer, pilih metode, catatan
- **Verifikasi Pembayaran**: Admin review dan approve/reject
- **Pemilihan Pemenang**: Acak otomatis dengan animasi atau pilih manual
- **Timeline Ronde**: Visual timeline semua ronde dengan histori

## 🎨 Desain Gen Z

- **Primary**: Emerald Green (#10B981)
- **Mobile-first** responsive design
- **Card-based** layouts dengan shadows
- **Emoji-friendly** copy
- **48px minimum** touch targets
- **Plus Jakarta Sans** typography
- **Kasual & ramah** tone (pakai "kamu")

## 🛠️ Tech Stack

- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Storage)
- React Hook Form + Zod
- Sonner (toasts)
- Lucide React (icons)

## 🚀 Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Setup `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

3. Setup database (run SQL files in Supabase):
\`\`\`bash
supabase/schema.sql
supabase/rls-policies.sql
\`\`\`

4. Run development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open `http://localhost:3000`

## 📁 Struktur Proyek

- **app/**: Pages (auth, dashboard, groups, payments)
- **components/**: UI components (ui/, shared/, groups/, payments/, rounds/)
- **lib/**: Utils, Supabase clients, auth actions, database queries
- **supabase/**: Database schema & RLS policies
- **hooks/**: React hooks (use-auth)

## 🎯 Format Indonesia

- **Mata Uang**: Rp 100.000 (period separator)
- **Nomor HP**: +62 812-3456-7890
- **Tanggal**: 8 Januari 2026

## 📊 Statistics

- **Pages**: 18 pages
- **Components**: 25+ components
- **TypeScript Files**: 54 files
- **Completion**: ~90%
- **Indonesian**: 100%
- **Mobile-First**: Yes

## 🔒 Security

- Row Level Security (RLS) enabled
- Session-based auth with Supabase
- Protected routes via middleware
- Server-side validation
- Secure file uploads

## 📝 License

Proprietary - Titik Jalin Projects

---

**Dibuat dengan ❤️ untuk Gen Z Indonesia** 🇮🇩
