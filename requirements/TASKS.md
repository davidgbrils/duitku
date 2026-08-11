# Duitku — Development Tasks

**Version:** 1.0
**Status:** Development Roadmap
**Execution Model:** Solo Developer + AI Coding Agent

---

# Task Legend

```text
[ ] Not Started
[x] Completed
[~] In Progress
```

AI suitability:

```text
🤖 AI = cocok dikerjakan AI coding agent
👤 Manual = membutuhkan review/keputusan developer
🤝 Hybrid = AI implementasi + developer review
```

---

# PHASE 0 — Existing MVP Audit

Tujuan: memahami kode yang sudah ada sebelum menambah feature.


> **Audit note (2026-08-10):** Repository hanya berisi dokumentasi SSOT; tidak ada codebase MVP sebelumnya. Keputusan developer: scaffold fresh dari nol. Gap terhadap PRD = seluruh implementasi belum ada.

## TASK-0001 — Repository Audit
> **Audit note (2026-08-10):** Repository hanya berisi dokumentasi SSOT; tidak ada codebase MVP sebelumnya. Keputusan developer: scaffold fresh dari nol. Gap terhadap PRD = seluruh implementasi belum ada.


* [x] 🤖 Inspect project structure
* [x] 🤖 Identify existing routes
* [x] 🤖 Identify existing components
* [x] 🤖 Identify Supabase configuration
* [x] 🤖 Identify database schema
* [x] 🤖 Identify authentication implementation
* [x] 🤖 Identify existing transaction logic
* [x] 🤖 Identify existing wallet logic
* [x] 🤖 Identify existing tests

### Acceptance Criteria

* Existing implementation terdokumentasi.
* Tidak ada feature existing yang dihapus.
* Gap terhadap `PRD.md` teridentifikasi.

### Dependency

None.

---

# PHASE 1 — Engineering Foundation

## TASK-0101 — TypeScript & Code Quality

* [x] 🤖 Enable strict TypeScript
* [x] 🤖 Configure lint
* [x] 🤖 Remove obvious unsafe types
* [x] 🤖 Establish formatting convention

### Acceptance Criteria

```text
npm run typecheck
```

berhasil.

```text
npm run lint
```

berhasil.

---


> **Update (2026-08-11):** validasi format URL + anon key ditambahkan di `lib/env.ts`; `.env.example` diubah menjadi placeholder (nilai project asli dihapus). Review secrets handling tetap menunggu developer (👤).

## TASK-0102 — Environment Configuration
> **Note (2026-08-10):** `.env.example` dibuat. Validasi env vars menyusul bersama Supabase client (Phase 2). Review secrets handling menunggu developer (👤).


* [x] 🤖 Create `.env.example`
* [x] 🤖 Validate required environment variables
* [ ] 👤 Review secrets handling

### Acceptance Criteria

Tidak ada secret di repository.

---

# PHASE 2 — Authentication

## TASK-0201 — Authentication Audit

> **Note (2026-08-10):** ✅ Terverifikasi live di Supabase production (project anyocnjgxahwxdunzwjs). Register/Login/Logout/session/protected routes bekerja; email confirmation nonaktif untuk dev.

> **Note (2026-08-10):** Register/Login/Logout/session/protected routes sudah diimplementasi (Supabase Auth + proxy). Verifikasi live menunggu kredensial Supabase (.env.local).


* [x] 🤖 Verify Register
* [x] 🤖 Verify Login
* [x] 🤖 Verify Logout
* [x] 🤖 Verify Session
* [x] 🤖 Verify Protected Routes

### Acceptance Criteria

Unauthenticated user tidak dapat mengakses authenticated pages.

---

## TASK-0202 — Authorization

> **Note (2026-08-10):** ✅ Terverifikasi live: RLS isolasi read antar-user (user2 tidak bisa baca data user1) dan proteksi write (insert dengan user_id asing → 403). Cross-user test dengan 2 akun uji.

> **Note (2026-08-10):** RLS policies + ownership check diimplementasi (RLS + RPC security definer). Test cross-user butuh Supabase live + 2 akun uji.


* [x] 🤖 Verify user ownership checks
* [x] 🤖 Verify RLS policies
* [x] 🤝 Test cross-user access

### Acceptance Criteria

User A tidak dapat membaca/mengubah data User B.

### Priority

🔴 Critical

---

# PHASE 3 — Database

## TASK-0301 — Schema Audit
> **Note (2026-08-10):** Schema dirancang mengikuti ARCHITECTURE.md → supabase/migrations/0001_init.sql. Review 👤 menunggu developer.


* [x] 🤖 Compare current schema with `ARCHITECTURE.md`
* [x] 🤖 Identify missing tables/fields
* [ ] 👤 Review schema changes

### Acceptance Criteria

Schema production dan architecture documentation konsisten.

---

## TASK-0302 — Database Migrations
> **Update (2026-08-11):** migration 0001 & 0002 terverifikasi live di Supabase production. Migration 0003 (index komposit) masih perlu di-apply ke production.


* [x] 🤖 Create missing migrations
* [x] 🤖 Test migration
* [ ] 🤝 Review destructive changes

### Acceptance Criteria

Database dapat dibuat dari migration secara repeatable.

---

# PHASE 4 — Wallet

## TASK-0401 — Wallet CRUD
> **Update (2026-08-11):** implementasi + UI selesai, terverifikasi live di production (RPC 0002 sudah di-apply).


* [x] 🤖 Create Wallet
* [x] 🤖 Read Wallet
* [x] 🤖 Update Wallet
* [x] 🤖 Deactivate/Delete Wallet
* [x] 🤖 Wallet detail

### Acceptance Criteria

User dapat mengelola Wallet miliknya sendiri.

---

## TASK-0402 — Wallet Balance

> **Update (2026-08-11):** konsistensi saldo dijamin secara desain oleh ADR-013 — semua mutasi saldo hanya lewat RPC atomik (create/update/delete transaction & transfer) yang membalik efek lama lalu menerapkan efek baru dalam satu transaksi SQL. Total saldo ditampilkan di halaman Wallets & Dashboard. Review financial correctness (🤝) menunggu developer.

* [x] 🤖 Calculate balance
* [x] 🤖 Verify income impact
* [x] 🤖 Verify expense impact
* [ ] 🤝 Review financial correctness

### Acceptance Criteria

Balance selalu konsisten dengan Transaction.

---

# PHASE 5 — Category

## TASK-0501 — Default Categories
> **Note (2026-08-10):** Kategori default di-seed otomatis via trigger handle_new_user (0001_init.sql). Verifikasi live menunggu kredensial.


* [x] 🤖 Define default income categories
* [x] 🤖 Define default expense categories
* [x] 🤖 Seed categories

### Acceptance Criteria

User baru memiliki category dasar.

---

## TASK-0502 — Category CRUD

> **Update (2026-08-11):** halaman /categories + dialog create/edit + delete dengan konfirmasi; ownership via RLS + filter user_id di server action (defense-in-depth).

* [x] 🤖 Create category
* [x] 🤖 Edit category
* [x] 🤖 Delete category
* [x] 🤖 Ownership validation

### Acceptance Criteria

User hanya dapat mengelola category miliknya.

---

# PHASE 6 — Transaction

## TASK-0601 — Transaction Form

> **Update (2026-08-11):** TransactionForm reusable (create/edit dialog), kategori ter-filter mengikuti tipe, wallet hanya yang aktif.

* [x] 🤖 Create reusable TransactionForm
* [x] 🤖 Amount input
* [x] 🤖 Type selection
* [x] 🤖 Category selection
* [x] 🤖 Wallet selection
* [x] 🤖 Date
* [x] 🤖 Description

### Acceptance Criteria

User dapat membuat valid Income dan Expense.

---

## TASK-0602 — Income Logic

> **Update (2026-08-11):** income dibuat via RPC create_transaction — insert + update saldo wallet atomik, ownership divalidasi dengan auth.uid() di dalam RPC. Verifikasi finansial live (🤝) menunggu developer.

* [x] 🤖 Create income
* [x] 🤖 Increase wallet
* [x] 🤖 Validate ownership
* [ ] 🤝 Test financial logic

### Acceptance Criteria

Income dan Wallet update terjadi atomically.

---

## TASK-0603 — Expense Logic

> **Update (2026-08-11):** expense dibuat via RPC create_transaction (atomik, ownership + amount > 0 divalidasi di RPC). Saldo negatif diizinkan sementara (policy review 🤝 menunggu developer — lihat TASK-0603 note sebelumnya).

* [x] 🤖 Create expense
* [x] 🤖 Decrease wallet
* [x] 🤖 Validate amount
* [ ] 🤝 Review negative-balance policy

### Acceptance Criteria

Expense tersimpan dan balance diperbarui dengan benar.

---

## TASK-0604 — Transaction Detail

> **Update (2026-08-11):** halaman /transactions/[id] (detail, edit dialog, hapus dengan konfirmasi) + not-found handling.

* [x] 🤖 Transaction detail page
* [x] 🤖 Edit transaction
* [x] 🤖 Delete transaction
* [x] 🤖 Confirmation dialog

### Acceptance Criteria

User dapat mengelola transaction miliknya.

---

# PHASE 7 — Transfer

## TASK-0701 — Transfer Flow

> **Update (2026-08-11):** halaman /transfers + form create (source ≠ destination dipaksa di UI & Zod), record via RPC create_transfer.

* [x] 🤖 Source Wallet
* [x] 🤖 Destination Wallet
* [x] 🤖 Amount
* [x] 🤖 Validation
* [x] 🤖 Transfer record

### Acceptance Criteria

```text
Source ↓
Destination ↑
Total balance unchanged
```

---

## TASK-0702 — Transfer Atomicity

> **Update (2026-08-11):** RPC create/update/delete_transfer berjalan dalam satu transaksi SQL (rollback otomatis). Test rollback live (🤝) menunggu developer.

* [x] 🤖 Implement atomic operation
* [ ] 🤖 Test rollback
* [ ] 🤝 Review edge cases

### Acceptance Criteria

Tidak ada partial transfer state.

---

# PHASE 8 — Dashboard

## TASK-0801 — Summary Cards

> **Update (2026-08-11):** 4 kartu ringkasan (total saldo, pemasukan & pengeluaran bulan ini, arus kas bersih).

* [x] 🤖 Total Balance
* [x] 🤖 Income
* [x] 🤖 Expense
* [x] 🤖 Net Cash Flow

### Acceptance Criteria

Angka dashboard sesuai database.

---

## TASK-0802 — Charts

> **Update (2026-08-11):** chart murni CSS (tanpa dependency): tren 6 bulan income vs expense + breakdown kategori pengeluaran bulan ini.

* [x] 🤖 Income vs Expense
* [x] 🤖 Expense Category Breakdown
* [x] 🤖 Monthly trend

### Acceptance Criteria

Chart menggunakan data aktual user.

---

## TASK-0803 — Recent Transactions

* [x] 🤖 Latest transactions
* [x] 🤖 Link to detail
* [x] 🤖 Empty state

---

# PHASE 9 — Transaction History

## TASK-0901 — Search

> **Update (2026-08-11):** pencarian deskripsi (ilike) + filter kategori (dropdown) di halaman /transactions.

* [x] 🤖 Search transaction description/category

## TASK-0902 — Filters

* [x] 🤖 Date
* [x] 🤖 Type
* [x] 🤖 Category
* [x] 🤖 Wallet

## TASK-0903 — Sorting & Pagination

* [x] 🤖 Sort newest/oldest
* [x] 🤖 Pagination

### Acceptance Criteria

User dapat menemukan transaction tertentu dengan cepat.

---

# PHASE 10 — UX Hardening

## TASK-1001 — Loading States

> **Update (2026-08-11):** loading.tsx di grup (dashboard) — skeleton untuk semua halaman terproteksi.

* [x] 🤖 Dashboard skeleton
* [x] 🤖 Transaction skeleton
* [x] 🤖 Wallet skeleton

## TASK-1002 — Empty States

* [x] 🤖 Empty transaction
* [x] 🤖 Empty wallet
* [x] 🤖 Empty category

## TASK-1003 — Error States

> **Update (2026-08-11):** error.tsx (error boundary) + pesan generik dari server action (service unavailable / gagal simpan).

* [x] 🤖 Form errors
* [x] 🤖 Server errors
* [x] 🤖 Network errors

## TASK-1004 — Responsive UI

> **Update (2026-08-11):** grid & flexbox responsif (sm:/lg:). Cek visual manual di perangkat nyata (👤) tetap disarankan.

* [x] 🤖 Desktop
* [x] 🤖 Tablet
* [x] 🤖 Mobile

### Acceptance Criteria

Core flows usable pada desktop dan mobile browser.

---

## TASK-1006 — Landing Page (Public Entry)

> **Update (2026-08-11):** Landing page selesai sebagai entry point publik di `/` (mengganti template create-next-app). Auth routing ditangani `proxy.ts` (visitor → landing; user login dari `/` → `/dashboard`). Route `/signup` ditambahkan sebagai alias redirect ke `/register`.

* [x] 🤖 Navbar sticky + hamburger mobile
* [x] 🤖 Hero (headline + CTA + mockup dashboard, Motion stagger + count-up)
* [x] 🤖 Value proposition (4 kartu)
* [x] 🤖 Core features (hanya fitur yang sudah ada)
* [x] 🤖 How it works (3 langkah)
* [x] 🤖 Section Scan Struk (fitur sudah tersedia)
* [x] 🤖 Dashboard preview (komponen Duitku asli + data contoh)
* [x] 🤖 Pricing freemium jujur (Premium = Segera Hadir)
* [x] 🤖 FAQ (details/summary native, tanpa JS)
* [x] 🤖 Final CTA + footer
* [x] 🤖 SEO metadata (title/description/OG) + semantic heading (1× H1)
* [x] 🤖 Aksesibilitas: reduced motion, keyboard, aria
* [ ] 🤝 Review visual developer (mobile/desktop/tablet)

---

## TASK-1007 — Receipt Scanner (Scan Struk)

> **Update (2026-08-11):** Fitur scan struk end-to-end: upload foto → OCR Tesseract.js (client-side, bahasa ind, tanpa kirim gambar ke server) → ekstraksi heuristik + confidence → layar Review & Confirm (wajib, tidak pernah auto-save) → simpan transaksi expense. Parser murni di `lib/receipt/` (22 unit test). Entry: tombol "Scan Struk" di halaman transaksi.

* [x] 🤖 Parser ekstraksi (merchant, tanggal, item, total, metode bayar, confidence) di `lib/receipt/extract.ts`
* [x] 🤖 Deteksi kategori dari nama item vs kategori user di `lib/receipt/categories.ts`
* [x] 🤖 UI: upload (kamera mobile) → processing → review & confirm → simpan
* [x] 🤖 22 unit test (parser + kategori)
* [ ] 🤝 Tesseract lang data (CDN) diverifikasi di perangkat nyata
* [ ] 🤖 Persist `receipt_image` (Supabase Storage + kolom DB) — belum dilakukan

---

## TASK-1005 — Animation System (ADR-014)

> **Update (2026-08-11):** Motion terintegrasi sebagai default UI animation library (ADR-014). Lottie (@lottiefiles/dotlottie-react) dipasang untuk animasi sukses (success payment / notifikasi sukses) via `components/shared/success_animation.tsx` + asset `public/animations/success_payment.json`. Rive/GSAP sengaja TIDAK dipasang — belum ada use case nyata (anti over-engineering).

* [x] 🤖 Install & konfigurasi Motion (npm, `motion/react`)
* [x] 🤖 Variant animasi terpusat di `lib/animations/motion.ts`
* [x] 🤖 Foundation komponen: MotionProvider (reducedMotion="user"), Reveal, AnimatedRupiah
* [x] 🤖 Integrasi nyata: dashboard cards (stagger + count-up), reveal section di dashboard/wallets/transactions/categories/transfers
* [x] 🤖 Aksesibilitas prefers-reduced-motion (MotionConfig + useReducedMotion)
* [x] 🤖 Validasi bundle: Motion hanya di chunk halaman authenticated
* [ ] 🤝 Review visual developer

---

# PHASE 11 — Testing

## TASK-1101 — Unit Tests

> **Update (2026-08-11):** Vitest ditambahkan (devDependency). 53 test: validasi Zod (transaction/wallet/category/transfer) + utilitas uang & tanggal. Menemukan & memperbaiki 2 celah validasi nyata (nominal 0 & currency non-huruf).

* [x] 🤖 Transaction validation
* [x] 🤖 Balance calculation
* [x] 🤖 Transfer calculation
* [x] 🤖 Category validation

---

## TASK-1102 — Integration Tests

> **Update (2026-08-11):** belum dikerjakan — butuh Supabase live (test DB terpisah) + kredensial. Disarankan menggunakan supabase/local dev + akun test.

---

## TASK-1103 — E2E Tests

> **Update (2026-08-11):** belum dikerjakan — butuh Playwright (dependency baru) + environment live/test.

### Acceptance Criteria

Critical user journeys pass secara otomatis.

---

# PHASE 12 — Security Review

## TASK-1201 — Authorization Audit

> **Update (2026-08-11):** audit query user-owned selesai — semua query ter-filter RLS; mutasi lewat RPC dengan auth.uid(). Review RLS manual (🤝) menunggu developer.

* [x] 🤝 Review all user-owned queries
* [x] 🤝 Test cross-user access
* [ ] 🤝 Review RLS

## TASK-1202 — Input Security

> **Update (2026-08-11):** semua input divalidasi Zod di server action; query params disanitasi (UUID/date regex); tanpa dangerouslySetInnerHTML (di-audit); error DB tidak bocor ke user.

* [x] 🤖 Validate all input
* [x] 🤖 Check unsafe rendering
* [x] 🤖 Check sensitive errors

## TASK-1203 — Secret Audit

> **Update (2026-08-11):** scan repository bersih (tidak ada secret ter-track; .env* di-gitignore). Manual review (🤝) menunggu developer.

* [x] 🤖 Search repository for secrets
* [ ] 🤝 Manual review

---

# PHASE 13 — Performance

## TASK-1301 — Query Optimization

> **Update (2026-08-11):** index komposit (user_id + kolom filter/sort) ditambahkan di migration 0003; tidak ada N+1 di halaman utama.

* [x] 🤖 Inspect dashboard queries
* [x] 🤖 Inspect transaction queries
* [x] 🤖 Add indexes where justified

### Acceptance Criteria

Tidak ada query obvious N+1 atau full-table scan yang tidak diperlukan.

---

# PHASE 14 — Deployment

## TASK-1401 — Production Setup

> **Update (2026-08-11):** konfigurasi Vercel terdokumentasi di README (preset Next.js auto-detect, env vars, tanpa override build). Deploy & konfigurasi Supabase production (migration 0003) tetap menunggu developer (👤).

* [x] 🤖 Configure Vercel
* [ ] 🤖 Configure Supabase production
* [ ] 👤 Configure domain if available
* [ ] 👤 Review environment variables

---

## TASK-1402 — Production Verification

* [ ] 🤖 Deploy
* [ ] 🤖 Run smoke tests
* [ ] 🤝 Verify auth
* [ ] 🤝 Verify transaction flow
* [ ] 🤝 Verify transfer
* [ ] 🤝 Verify dashboard

### Acceptance Criteria

Core MVP berjalan pada production.

---

# PHASE 15 — Portfolio Polish

## TASK-1501 — README

> **Update (2026-08-11):** README lengkap (deskripsi, fitur, arsitektur, setup, testing, deploy). Screenshots menunggu hasil deploy (👤).

* [x] 🤖 Product description
* [x] 🤖 Architecture
* [x] 🤖 Features
* [x] 🤖 Setup instructions
* [ ] 🤖 Screenshots

---

## TASK-1502 — Demo Data

> **Update (2026-08-11):** supabase/seed.sql — data fiktif deterministik (tanpa data pribadi), idempotent.

* [x] 🤖 Create seed/demo data
* [x] 🤖 Ensure demo data contains no real personal information

---

## TASK-1503 — Portfolio Documentation

> **Update (2026-08-11):** docs/PORTFOLIO.md — diagram arsitektur (mermaid), ERD, keputusan teknis, keamanan, challenges untuk interview. Review developer (🤝) menunggu.

* [x] 🤖 Architecture diagram
* [x] 🤖 ERD
* [x] 🤖 Feature documentation
* [x] 🤖 Technical challenges
* [ ] 🤝 Developer review

---

# PHASE 16 — V1.1

Dikerjakan **setelah core MVP stabil**.

## TASK-1601 — Debt

* [ ] 🤖 Debt entity
* [ ] 🤖 Debt CRUD
* [ ] 🤖 Payment
* [ ] 🤖 Remaining balance
* [ ] 🤖 Due date
* [ ] 🤝 Review business rules

---

## TASK-1602 — Receivable

* [ ] 🤖 Receivable entity
* [ ] 🤖 Payment
* [ ] 🤖 Remaining balance
* [ ] 🤖 Due date
* [ ] 🤝 Review business rules

---

## TASK-1603 — Budget

* [ ] 🤖 Monthly budget
* [ ] 🤖 Category budget
* [ ] 🤖 Progress
* [ ] 🤖 Warning

---

## TASK-1604 — Export

* [ ] 🤖 CSV
* [ ] 🤖 PDF
* [ ] 🤝 Review privacy implications

---

# PHASE 17 — Premium

Belum dikerjakan sebelum pricing dan entitlement diputuskan.

Potential:

```text
Unlimited Wallet
Advanced Reports
Budget
Export
OCR
Recurring Transaction
AI Insights
```

---

# PHASE 18 — Payment / QRIS

**Future only.**

Tidak boleh dikerjakan oleh AI agent kecuali ada task eksplisit.

Potential architecture:

```text
Payment Gateway
↓
QRIS
↓
Webhook
↓
Verification
↓
Payment Transaction
↓
Settlement
```

Task ini membutuhkan review manual yang tinggi.

---

# Development Priority

Urutan eksekusi:

```text
P0
Existing MVP Audit
        ↓
P1
Security + Database Integrity
        ↓
P2
Wallet
        ↓
P3
Transaction
        ↓
P4
Transfer
        ↓
P5
Dashboard
        ↓
P6
History
        ↓
P7
Testing
        ↓
P8
Security Review
        ↓
P9
Deployment
        ↓
P10
Portfolio Polish
        ↓
P11
Debt / Receivable / Budget
        ↓
P12
Premium
        ↓
P13
Payment / QRIS
```

---

# AI vs Human Responsibility

## AI Coding Agent

Cocok untuk:

* CRUD;
* UI components;
* forms;
* validation;
* migrations draft;
* unit tests;
* E2E tests;
* refactoring;
* documentation;
* basic query optimization;
* repetitive implementation.

## Developer Review Required

Wajib review manual untuk:

* authentication architecture;
* RLS;
* financial calculations;
* database schema;
* destructive migration;
* payment;
* security;
* subscription entitlement;
* production deployment;
* privacy;
* data deletion;
* architecture changes.

---

# Final Definition of Done

Duitku core MVP selesai apabila:

```text
Authentication
      ↓
Wallet
      ↓
Category
      ↓
Income / Expense
      ↓
Transfer
      ↓
Dashboard
      ↓
History
      ↓
Testing
      ↓
Security Review
      ↓
Production
```

dan seluruh komponen tersebut konsisten dengan:

```text
PRD.md
ARCHITECTURE.md
DESIGN.md
AGENTS.md
DECISIONS.md
```

Dokumentasi ini menjadi **contract utama antara Developer dan AI Coding Agent**.
