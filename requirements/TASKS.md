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


> **Note (2026-08-10):** `.env.example` dibuat. Validasi env vars menyusul bersama Supabase client (Phase 2). Review secrets handling menunggu developer (👤).

## TASK-0102 — Environment Configuration
> **Note (2026-08-10):** `.env.example` dibuat. Validasi env vars menyusul bersama Supabase client (Phase 2). Review secrets handling menunggu developer (👤).


* [x] 🤖 Create `.env.example`
* [ ] 🤖 Validate required environment variables
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
> **Note (2026-08-10):** 0001_init.sql dibuat. Test migration menunggu Supabase project.


* [x] 🤖 Create missing migrations
* [ ] 🤖 Test migration
* [ ] 🤝 Review destructive changes

### Acceptance Criteria

Database dapat dibuat dari migration secara repeatable.

---

# PHASE 4 — Wallet

## TASK-0401 — Wallet CRUD
> **Note (2026-08-10):** Implementasi selesai (RPC create/update/delete_wallet di 0002 + UI /wallets). Verifikasi live menunggu migration 0002 di-apply ke Supabase.


* [~] 🤖 Create Wallet
* [~] 🤖 Read Wallet
* [~] 🤖 Update Wallet
* [~] 🤖 Deactivate/Delete Wallet
* [~] 🤖 Wallet detail

### Acceptance Criteria

User dapat mengelola Wallet miliknya sendiri.

---

## TASK-0402 — Wallet Balance

* [ ] 🤖 Calculate balance
* [ ] 🤖 Verify income impact
* [ ] 🤖 Verify expense impact
* [ ] 🤝 Review financial correctness

### Acceptance Criteria

Balance selalu konsisten dengan Transaction.

---

# PHASE 5 — Category

## TASK-0501 — Default Categories
> **Note (2026-08-10):** Kategori default di-seed otomatis via trigger handle_new_user (0001_init.sql). Verifikasi live menunggu kredensial.


* [x] 🤖 Define default income categories
* [x] 🤖 Define default expense categories
* [~] 🤖 Seed categories

### Acceptance Criteria

User baru memiliki category dasar.

---

## TASK-0502 — Category CRUD

* [ ] 🤖 Create category
* [ ] 🤖 Edit category
* [ ] 🤖 Delete category
* [ ] 🤖 Ownership validation

### Acceptance Criteria

User hanya dapat mengelola category miliknya.

---

# PHASE 6 — Transaction

## TASK-0601 — Transaction Form

* [ ] 🤖 Create reusable TransactionForm
* [ ] 🤖 Amount input
* [ ] 🤖 Type selection
* [ ] 🤖 Category selection
* [ ] 🤖 Wallet selection
* [ ] 🤖 Date
* [ ] 🤖 Description

### Acceptance Criteria

User dapat membuat valid Income dan Expense.

---

## TASK-0602 — Income Logic

* [ ] 🤖 Create income
* [ ] 🤖 Increase wallet
* [ ] 🤖 Validate ownership
* [ ] 🤝 Test financial logic

### Acceptance Criteria

Income dan Wallet update terjadi atomically.

---

## TASK-0603 — Expense Logic

* [ ] 🤖 Create expense
* [ ] 🤖 Decrease wallet
* [ ] 🤖 Validate amount
* [ ] 🤝 Review negative-balance policy

### Acceptance Criteria

Expense tersimpan dan balance diperbarui dengan benar.

---

## TASK-0604 — Transaction Detail

* [ ] 🤖 Transaction detail page
* [ ] 🤖 Edit transaction
* [ ] 🤖 Delete transaction
* [ ] 🤖 Confirmation dialog

### Acceptance Criteria

User dapat mengelola transaction miliknya.

---

# PHASE 7 — Transfer

## TASK-0701 — Transfer Flow

* [ ] 🤖 Source Wallet
* [ ] 🤖 Destination Wallet
* [ ] 🤖 Amount
* [ ] 🤖 Validation
* [ ] 🤖 Transfer record

### Acceptance Criteria

```text
Source ↓
Destination ↑
Total balance unchanged
```

---

## TASK-0702 — Transfer Atomicity

* [ ] 🤖 Implement atomic operation
* [ ] 🤖 Test rollback
* [ ] 🤝 Review edge cases

### Acceptance Criteria

Tidak ada partial transfer state.

---

# PHASE 8 — Dashboard

## TASK-0801 — Summary Cards

* [ ] 🤖 Total Balance
* [ ] 🤖 Income
* [ ] 🤖 Expense
* [ ] 🤖 Net Cash Flow

### Acceptance Criteria

Angka dashboard sesuai database.

---

## TASK-0802 — Charts

* [ ] 🤖 Income vs Expense
* [ ] 🤖 Expense Category Breakdown
* [ ] 🤖 Monthly trend

### Acceptance Criteria

Chart menggunakan data aktual user.

---

## TASK-0803 — Recent Transactions

* [ ] 🤖 Latest transactions
* [ ] 🤖 Link to detail
* [ ] 🤖 Empty state

---

# PHASE 9 — Transaction History

## TASK-0901 — Search

* [ ] 🤖 Search transaction description/category

## TASK-0902 — Filters

* [ ] 🤖 Date
* [ ] 🤖 Type
* [ ] 🤖 Category
* [ ] 🤖 Wallet

## TASK-0903 — Sorting & Pagination

* [ ] 🤖 Sort newest/oldest
* [ ] 🤖 Pagination

### Acceptance Criteria

User dapat menemukan transaction tertentu dengan cepat.

---

# PHASE 10 — UX Hardening

## TASK-1001 — Loading States

* [ ] 🤖 Dashboard skeleton
* [ ] 🤖 Transaction skeleton
* [ ] 🤖 Wallet skeleton

## TASK-1002 — Empty States

* [ ] 🤖 Empty transaction
* [ ] 🤖 Empty wallet
* [ ] 🤖 Empty category

## TASK-1003 — Error States

* [ ] 🤖 Form errors
* [ ] 🤖 Server errors
* [ ] 🤖 Network errors

## TASK-1004 — Responsive UI

* [ ] 🤖 Desktop
* [ ] 🤖 Tablet
* [ ] 🤖 Mobile

### Acceptance Criteria

Core flows usable pada desktop dan mobile browser.

---

# PHASE 11 — Testing

## TASK-1101 — Unit Tests

* [ ] 🤖 Transaction validation
* [ ] 🤖 Balance calculation
* [ ] 🤖 Transfer calculation
* [ ] 🤖 Category validation

---

## TASK-1102 — Integration Tests

* [ ] 🤖 Create income
* [ ] 🤖 Create expense
* [ ] 🤖 Transfer
* [ ] 🤖 Authorization

---

## TASK-1103 — E2E Tests

* [ ] 🤖 Login
* [ ] 🤖 Create wallet
* [ ] 🤖 Create income
* [ ] 🤖 Create expense
* [ ] 🤖 Transfer
* [ ] 🤖 Dashboard
* [ ] 🤖 History

### Acceptance Criteria

Critical user journeys pass secara otomatis.

---

# PHASE 12 — Security Review

## TASK-1201 — Authorization Audit

* [ ] 🤝 Review all user-owned queries
* [x] 🤝 Test cross-user access
* [ ] 🤝 Review RLS

## TASK-1202 — Input Security

* [ ] 🤖 Validate all input
* [ ] 🤖 Check unsafe rendering
* [ ] 🤖 Check sensitive errors

## TASK-1203 — Secret Audit

* [ ] 🤖 Search repository for secrets
* [ ] 🤝 Manual review

---

# PHASE 13 — Performance

## TASK-1301 — Query Optimization

* [ ] 🤖 Inspect dashboard queries
* [ ] 🤖 Inspect transaction queries
* [ ] 🤖 Add indexes where justified

### Acceptance Criteria

Tidak ada query obvious N+1 atau full-table scan yang tidak diperlukan.

---

# PHASE 14 — Deployment

## TASK-1401 — Production Setup

* [ ] 🤖 Configure Vercel
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

* [ ] 🤖 Product description
* [ ] 🤖 Architecture
* [ ] 🤖 Features
* [ ] 🤖 Setup instructions
* [ ] 🤖 Screenshots

---

## TASK-1502 — Demo Data

* [ ] 🤖 Create seed/demo data
* [ ] 🤖 Ensure demo data contains no real personal information

---

## TASK-1503 — Portfolio Documentation

* [ ] 🤖 Architecture diagram
* [ ] 🤖 ERD
* [ ] 🤖 Feature documentation
* [ ] 🤖 Technical challenges
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
