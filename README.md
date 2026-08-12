# Duitku — Personal Finance Tracker

Aplikasi web **pencatatan keuangan pribadi** modern & responsif (bahasa Indonesia) untuk mencatat pemasukan & pengeluaran, mengelola wallet, kategori, transfer antar wallet, serta **pindai struk belanja otomatis dengan OCR & AI LLM Vision**.

> Project portfolio & produksi — dibuat dengan fokus: **aman, atomik, presisi, sederhana, dan ramah pengguna mobile & desktop**.

---

## ✨ Fitur Utama

| Fitur | Deskripsi | Status |
| --- | --- | --- |
| **Autentikasi Aman** | Register, Login, Logout, Protected Routes via Supabase Auth | ✅ |
| **Pindai Struk (OCR & AI Vision)** | Ekstraksi otomatis nama toko, tanggal, item barang, total & kategori dari foto struk (Tesseract.js Lokal + Gemini AI Vision ✨) | ✅ |
| **Kelola Wallet / Dompet** | Multi-wallet (Cash, Bank, E-Wallet, Kartu) dengan akumulasi saldo real-time | ✅ |
| **Kelola Kategori** | Kategori pemasukan & pengeluaran yang dapat disesuaikan (auto-seed default) | ✅ |
| **Transaksional Income & Expense** | Pencatatan transaksi cepat dengan validasi nominal Zod & mutasi atomik | ✅ |
| **Transfer Antar Wallet** | Pindah dana antar wallet secara atomik tanpa mengubah total kekayaan | ✅ |
| **Dashboard Visual** | Ringkasan saldo, arus kas bersih, tren 6 bulan, breakdown kategori, dan Hero Banner resmi | ✅ |
| **Riwayat & Filter** | Pencarian, filter multi-kriteria (tipe, wallet, kategori, tanggal), dan paginasi | ✅ |
| **Sistem Brand Identity** | Logo resmi Duitku, icon app rounded, hero mockup, & favicons otomatis | ✅ |
| **Keamanan Data & RLS** | PostgreSQL Row Level Security (RLS) + Mutasi via RPC Security Definer | ✅ |

---

## 🧱 Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack) + TypeScript (Strict Mode)
- **Styling & Design System:** Tailwind CSS 4 + shadcn/ui + Motion (Framer Motion)
- **Database & Auth:** Supabase PostgreSQL + Row Level Security (RLS) + `@supabase/ssr`
- **OCR & AI Vision:** Tesseract.js (Client-side OCR) + Google Gemini 2.5 Flash API (Structured JSON Vision)
- **Validasi & Form:** Zod + React Hook Form
- **Testing Suite:** Vitest (Unit Test untuk Money Math, Rules & Validasi)

---

## 🚀 Setup Lokal (Langkah demi Langkah)

### 1. Prasyarat System

- Node.js 20.x atau versi lebih baru
- npm / pnpm / yarn
- Akun [Supabase](https://supabase.com) (Free Tier cukup)
- (Opsional) Akun [Google AI Studio](https://aistudio.google.com/) untuk `GEMINI_API_KEY` (Fitur Scan Struk AI Vision)

### 2. Clone & Instalasi Dependencies

```bash
# Clone repository
git clone https://github.com/davidgbrils/duitku.git
cd duitku

# Install dependencies
npm ci
```

### 3. Setup Database Supabase Manually

1. Login ke [supabase.com](https://supabase.com) dan buat **New Project**.
2. Masuk ke menu **SQL Editor**, buat query baru, lalu jalankan file migration secara berurutan:
   - File 1: [`supabase/migrations/0001_init.sql`](file:///d:/Documents/Project/DUITKU/duitku/supabase/migrations/0001_init.sql)
   - File 2: [`supabase/migrations/0002_wallet_crud.sql`](file:///d:/Documents/Project/DUITKU/duitku/supabase/migrations/0002_wallet_crud.sql)
   - File 3: [`supabase/migrations/0003_performance_indexes.sql`](file:///d:/Documents/Project/DUITKU/duitku/supabase/migrations/0003_performance_indexes.sql)
3. Buka **Project Settings → API**, catat:
   - `Project URL`
   - `anon public` key

### 4. Konfigurasi Environment Variables (`.env.local`)

Salin file `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Isi variabel di `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>

# App URL Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Gemini API Key (Opsional: Untuk fitur Scan Struk AI LLM Vision 99% Akurat)
GEMINI_API_KEY=AIzaSy...
```

### 5. Jalankan Server Lokal

```bash
npm run dev
```

Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Verifikasi & Testing

Sebelum melakukan deploy, pastikan seluruh pemeriksaan tipe & testing lulus:

```bash
# Running TypeScript strict check
npm run typecheck

# Running Vitest unit test suite (77 tests)
npm run test

# Running production build test
npm run build
```

---

## ☁️ Panduan Hosting / Deploy ke Vercel

### Langkah 1: Push Asset & Code ke Repository GitHub

Pastikan seluruh file baru dan asset brand di folder `public/images/brand/` ikut di-push ke GitHub:

```bash
git add .
git commit -m "feat: setup complete duitku app with brand assets and AI Vision"
git push origin main
```

### Langkah 2: Import Project di Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan klik **Add New... → Project**.
2. Pilih repository GitHub **`duitku`**.
3. Framework Preset: **Next.js** (secara otomatis terdeteksi).
4. Root Directory: `./` (default).

### Langkah 3: Tambahkan Environment Variables di Vercel Settings

Di menu **Environment Variables**, tambahkan variabel berikut untuk Environment **Production, Preview, dan Development**:

| Key | Value | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon-public-key>` | Supabase Anon Key |
| `NEXT_PUBLIC_SITE_URL` | `https://duitku.vercel.app` | URL domain Vercel Anda |
| `GEMINI_API_KEY` | `AIzaSy...` | API Key dari Google AI Studio |

Klik **Deploy**.

### Langkah 4: Sesuaikan URL Konfigurasi Supabase Auth

Setelah mendapatkan domain Vercel (misal: `https://duitku.vercel.app`):

1. Masuk ke **Supabase Dashboard → Authentication → URL Configuration**.
2. Set **Site URL**: `https://duitku.vercel.app`.
3. Tambahkan ke **Redirect URLs**:
   - `http://localhost:3000/**`
   - `https://duitku.vercel.app/**`

---

## 📋 Daftar Hal yang Harus Dibuat / Disiapkan Secara Manual

| No | Komponen | Lokasi / Platform | Keterangan Manual |
| --- | --- | --- | --- |
| 1 | **Proyek Supabase** | [supabase.com](https://supabase.com) | Buat project baru & dapatkan URL + Anon Key |
| 2 | **Skema SQL Migration** | Supabase SQL Editor | Copas & Run file `0001_init.sql`, `0002_wallet_crud.sql`, `0003_performance_indexes.sql` |
| 3 | **Google Gemini API Key** | [aistudio.google.com](https://aistudio.google.com/) | Buat API Key gratis untuk fitur Scan Struk AI Vision |
| 4 | **`.env.local` File** | Root folder project | Tempat menyimpan secret key lokal |
| 5 | **Vercel Project & Env** | [vercel.com](https://vercel.com) | Import repo & pasang 4 Environment Variables |
| 6 | **Supabase Auth Redirect** | Supabase Authentication Settings | Mendaftarkan URL Vercel ke Whitelist Auth |

---

## 📁 Struktur Folder Utama

```
app/                  # App Router Next.js (Routes & Layouts)
  (auth)/             # Halaman Login & Register
  (dashboard)/        # Halaman Utama Dashboard, Transaksi, Wallet, Kategori, Transfer
actions/              # Server Actions (Mutasi Supabase RPC & Gemini AI Vision)
components/           # UI Components (shadcn/ui, Scanner Modal, Cards, Dialogs)
lib/
  receipt/            # Parser & Ekstraksi Struk (Tesseract + Regex + Brand Category Matcher)
  supabase/           # Client & Server Supabase Client
  utils/              # Money Helper (Numeric 19,2), Date Formatting
  validations/        # Zod Validation Schemas
public/
  images/brand/       # Asset Gambar Brand Duitku (Logo, App Icon, Hero Mockup, Favicon)
supabase/
  migrations/         # File Migration SQL Database PostgreSQL
tests/unit/           # Vitest Unit Tests
```

---

## 🔐 Keamanan & Integritas Data

- **Supabase Row Level Security (RLS)**: Diaktifkan pada seluruh tabel (`profiles`, `wallets`, `categories`, `transactions`, `transfers`). User A tidak bisa membaca atau mengubah data milik User B.
- **Financial Atomicity via RPC**: Mutasi saldo dan transaksi dijalankan secara atomik lewat PostgreSQL Stored Procedure (`SECURITY DEFINER`), mencegah inkonsistensi saldo parsial.
- **Client & Server Double Validation**: Input divalidasi dua lapis dengan library Zod baik di sisi UI maupun Server Action.

---

© 2026 Duitku — *Kelola Keuanganmu, Lebih Sederhana.*
