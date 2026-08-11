# Duitku — Personal Finance Tracker

Aplikasi web **pencatatan keuangan pribadi** (bahasa Indonesia) untuk mencatat pemasukan & pengeluaran, mengelola wallet, kategori, dan transfer antar wallet — dengan dashboard ringkasan dan riwayat transaksi yang bisa difilter.

> Project portfolio — dibuat oleh solo developer dengan fokus: **aman, sederhana, dan mudah dipahami**.

## ✨ Fitur

| Fitur | Status |
| --- | --- |
| Autentikasi (register/login/logout, protected routes) | ✅ |
| Wallet CRUD (cash, bank, e-wallet, lainnya) + saldo | ✅ |
| Kategori CRUD (pemasukan & pengeluaran, seed otomatis) | ✅ |
| Transaksi income/expense (create, edit, delete) | ✅ |
| Transfer antar wallet (atomik) | ✅ |
| Dashboard: total saldo, arus kas, tren bulanan, breakdown kategori | ✅ |
| Riwayat: cari, filter (tipe/kategori/wallet/tanggal), urutkan, paginasi | ✅ |
| Unit test (validasi & utilitas keuangan) | ✅ |

## 🧱 Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack) + TypeScript strict
- **UI:** Tailwind CSS 4 + shadcn/ui (Base UI) — dark mode siap
- **Database:** Supabase PostgreSQL + Row Level Security (RLS)
- **Auth:** Supabase Auth (email/password) via `@supabase/ssr`
- **Validasi:** Zod + React Hook Form
- **Testing:** Vitest

## 🏗️ Arsitektur Singkat

```
Browser ──▶ Next.js (App Router)
              ├── proxy.ts        → proteksi route + session (Next 16 convention)
              ├── app/            → halaman (Server Components)
              ├── features/       → form client (react-hook-form + zod)
              ├── actions/        → Server Actions (validasi Zod → RPC)
              └── lib/            → supabase client, validasi, util uang/tanggal
                      │
                      ▼
              Supabase PostgreSQL
              ├── RLS (ownership: user hanya akses datanya sendiri)
              └── RPC SECURITY DEFINER (semua mutasi finansial atomik)
```

**Poin arsitektur penting:**

- Semua operasi finansial (transaksi, transfer, mutasi saldo) hanya lewat **RPC `SECURITY DEFINER`** — client tidak bisa INSERT/UPDATE/DELETE langsung, sehingga invariant saldo tidak bisa dilewati.
- Uang disimpan sebagai `NUMERIC(19,2)` (bukan float); formatter Rupiah **deterministik** (identik di server & browser).
- Ownership divalidasi dua lapis: **RLS** di database + validasi **Zod** di server action.

Dokumentasi lengkap: [`requirements/`](requirements/) (PRD, ARCHITECTURE, DESIGN, DECISIONS, TASKS) dan [`docs/PORTFOLIO.md`](docs/PORTFOLIO.md).

## 🚀 Setup Lokal

### 1. Prasyarat

- Node.js 20+
- Akun [Supabase](https://supabase.com) (free tier cukup)

### 2. Instalasi

```bash
npm ci
```

### 3. Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan migration secara berurutan:
   ```bash
   supabase/migrations/0001_init.sql
   supabase/migrations/0002_wallet_crud.sql
   supabase/migrations/0003_performance_indexes.sql
   ```
   (atau pakai Supabase CLI: `supabase db push`)
3. Catat **Project URL** dan **anon public key** dari *Project Settings → API*.

### 4. Environment Variables

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

> Tanpa `.env.local` aplikasi tetap bisa dijalankan (halaman publik tampil, proteksi auth dilewati) — sesuai desain agar `next build` tidak gagal sebelum env diisi.

## 🧪 Testing

```bash
npm test          # unit test (Vitest)
npm run typecheck # TypeScript strict
npm run lint      # ESLint
npm run build     # production build
```

## ☁️ Deploy ke Vercel

1. Push repository ke GitHub.
2. Di [vercel.com](https://vercel.com) → **Add New Project** → pilih repo.
3. Framework preset: **Next.js** (auto-detect), Root Directory: `./`, **jangan override** build settings.
4. Tambah environment variables (sama untuk Production/Preview/Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://duitku.vercel.app` (URL deploy kamu)
5. Deploy.

## 📁 Struktur Folder

```
app/                  # Routes (App Router)
  (auth)/             # /login, /register
  (dashboard)/        # /dashboard, /wallets, /categories, /transactions, /transfers
actions/              # Server Actions (mutasi lewat RPC)
components/           # UI + komponen fitur
features/             # Form client per fitur
lib/
  supabase/           # client & server Supabase
  utils/              # money, date, navigation
  validations/        # Schema Zod
supabase/
  migrations/         # SQL migration (SSOT database)
tests/unit/           # Unit test
types/database.ts     # Tipe database (manual, sinkron dengan migration)
```

## 🔐 Keamanan

- **RLS** aktif di semua tabel user-owned — User A tidak bisa membaca/mengubah data User B.
- Mutasi finansial via RPC dengan validasi `auth.uid()` di dalam database (bukan dari client).
- Semua input divalidasi **Zod di server** (bukan hanya UX frontend).
- Error database tidak pernah bocor ke user (pesan generik + log teknis).
- Secret tidak pernah di-commit; `.env*` ter-ignore.
