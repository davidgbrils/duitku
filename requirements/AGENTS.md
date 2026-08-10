# Duitku — AI Coding Agent Rules

**Purpose:** Source of truth untuk AI coding agent.

---

# 1. Mission

AI coding agent bertugas membantu mengembangkan Duitku sesuai:

1. `PRD.md`
2. `ARCHITECTURE.md`
3. `DESIGN.md`
4. `DECISIONS.md`
5. `TASKS.md`

Dokumen tersebut lebih tinggi prioritasnya daripada asumsi agent.

Jika requirement bertentangan dengan dokumen, **jangan menebak**.

---

# 2. Golden Rules

## Rule 1 — Do Not Invent Requirements

Jangan menambahkan fitur yang tidak diminta.

Contoh:

User meminta transaction filter.

Jangan otomatis menambahkan:

* AI;
* subscription;
* QRIS;
* notification;
* bank integration.

---

## Rule 2 — Read Documentation First

Sebelum mengerjakan task:

```text
Read PRD
↓
Read ARCHITECTURE
↓
Read DESIGN
↓
Read DECISIONS
↓
Read TASKS
↓
Inspect existing code
↓
Implement
```

---

## Rule 3 — Preserve Existing Functionality

Duitku sudah memiliki MVP.

Jangan rewrite atau rebuild fitur existing tanpa alasan.

---

# 3. Tech Stack Rules

Wajib:

```text
Next.js
TypeScript
Supabase
PostgreSQL
Tailwind CSS
shadcn/ui
Zod
React Hook Form
```

Jangan mengganti framework utama tanpa keputusan baru.

---

# 4. TypeScript

Gunakan strict typing.

Jangan:

```ts
any
```

kecuali benar-benar diperlukan dan diberi alasan.

Prefer:

```ts
unknown
```

lalu lakukan narrowing.

Jangan mengabaikan TypeScript error dengan:

```ts
// @ts-ignore
```

atau:

```ts
// @ts-nocheck
```

kecuali ada alasan teknis yang terdokumentasi.

---

# 5. Naming

## Variables

```ts
camelCase
```

Contoh:

```ts
transactionAmount
walletBalance
```

## Functions

```ts
camelCase
```

Contoh:

```ts
createTransaction()
updateWalletBalance()
```

## Components

```text
PascalCase
```

Contoh:

```text
TransactionForm.tsx
WalletCard.tsx
DashboardSummary.tsx
```

## Database

Gunakan:

```text
snake_case
```

Contoh:

```text
transaction_date
user_id
wallet_id
created_at
```

---

# 6. Components

Jangan membuat component raksasa.

Jika component sudah memiliki banyak responsibility, pecah menjadi:

```text
Page
 ↓
Feature Component
 ↓
Reusable UI Component
```

Business logic tidak boleh tersebar di berbagai UI components.

---

# 7. Business Logic

Business-critical logic harus berada di server-side/application layer.

Contoh:

* update wallet balance;
* create expense;
* create income;
* transfer;
* ownership check.

Jangan mempercayai nominal dari client.

---

# 8. Authentication

Setiap operation yang mengakses user data harus:

1. mendapatkan authenticated user;
2. memastikan user valid;
3. memastikan record dimiliki user;
4. baru melakukan mutation/query.

Jangan menerima `user_id` dari client sebagai sumber kebenaran.

Gunakan authenticated session.

---

# 9. Authorization

User A tidak boleh mengakses:

```text
Wallet User B
Transaction User B
Category User B
Transfer User B
```

RLS PostgreSQL wajib menjadi defense layer.

Application-level authorization juga harus diterapkan pada business-critical operation.

---

# 10. Money Rules

Jangan gunakan floating point untuk perhitungan uang.

Jangan:

```ts
number
```

untuk logic yang dapat menghasilkan precision issue tanpa handling yang tepat.

Database harus menggunakan precision numeric atau integer minor units sesuai keputusan architecture.

---

# 11. Transaction Rules

Expense:

```text
wallet balance ↓
```

Income:

```text
wallet balance ↑
```

Transfer:

```text
source wallet ↓
destination wallet ↑
```

Transfer bukan expense.

Transfer bukan income.

---

# 12. Atomicity

Operation financial harus atomic.

Tidak boleh:

```text
create transaction
↓
update balance gagal
```

menghasilkan state parsial.

Gunakan database transaction/RPC yang sesuai.

---

# 13. Validation

Semua input:

```text
Client validation
+
Server validation
```

Zod digunakan sebagai standard validation library.

Jangan hanya mengandalkan form validation frontend.

---

# 14. Database Changes

**Jangan mengubah database schema secara manual di production.**

Gunakan migration.

Setiap perubahan schema:

```text
Create migration
↓
Test migration
↓
Update architecture documentation if material
↓
Apply
```

Jika perubahan mengubah entity/relationship/field penting, `ARCHITECTURE.md` wajib diperbarui.

---

# 15. Package Installation

Jangan install package baru tanpa alasan.

Sebelum menambahkan dependency:

1. cek apakah functionality sudah tersedia;
2. cek package yang sudah digunakan;
3. jelaskan alasan;
4. pastikan dependency benar-benar diperlukan.

Jangan menambah library hanya karena lebih nyaman.

---

# 16. UI Rules

Gunakan existing UI components terlebih dahulu.

Prioritaskan:

```text
shadcn/ui
Tailwind
existing components
```

Jangan membuat design system baru untuk satu halaman.

---

# 17. Error Handling

Jangan expose:

* SQL error;
* stack trace;
* secret;
* internal implementation;
* database detail.

ke user.

User mendapatkan error yang actionable.

---

# 18. Testing

Minimal test untuk:

### Unit

* validation;
* money calculation;
* transaction rules;
* transfer logic;
* balance calculation.

### E2E

Minimal:

```text
Register/Login
↓
Create Wallet
↓
Create Income
↓
Create Expense
↓
Transfer
↓
View Dashboard
↓
View History
```

Critical financial flows harus memiliki test sebelum dianggap selesai.

---

# 19. Git

Branch:

```text
main
```

Production-ready.

Feature:

```text
feature/<short-name>
```

Bug:

```text
fix/<short-name>
```

Refactor:

```text
refactor/<short-name>
```

---

# 20. Commit Convention

Gunakan Conventional Commits.

Contoh:

```text
feat: add transaction creation
fix: prevent negative wallet balance
refactor: extract transaction validation
test: add transfer business logic tests
docs: update architecture
chore: update dependencies
```

Jangan:

```text
update
fix
asdf
final
done
```

---

# 21. Documentation Rule

Jika implementasi mengubah:

* architecture;
* database;
* API contract;
* business rules;
* feature scope;

agent harus mengusulkan update documentation.

Jangan silently mengubah source of truth.

---

# 22. AI Agent Workflow

Untuk setiap task:

```text
1. Read task
2. Identify dependencies
3. Inspect existing implementation
4. Identify affected files
5. Implement smallest correct change
6. Run typecheck
7. Run lint
8. Run relevant tests
9. Review diff
10. Report changes
```

---

# 23. Stop and Ask

Agent **WAJIB bertanya** jika:

* requirement ambigu;
* terdapat dua kemungkinan business rule;
* database design perlu berubah secara material;
* task berpotensi menghapus data;
* task menyentuh authentication/security;
* task menyentuh payment;
* task membutuhkan package baru yang signifikan;
* existing code bertentangan dengan documentation;
* perubahan berpotensi merusak feature existing.

Jangan membuat asumsi besar hanya untuk menyelesaikan task lebih cepat.

---

# 24. Safe Assumptions

Agent boleh mengambil asumsi kecil jika:

* tidak mengubah architecture;
* tidak mengubah database;
* tidak mengubah business rule;
* mudah dibalik;
* konsisten dengan Design System.

Jika asumsi tersebut berdampak besar, bertanya terlebih dahulu.

---

# 25. Definition of Done

Task dianggap selesai jika:

* implementation selesai;
* TypeScript tidak error;
* lint tidak error;
* test relevan pass;
* UX state tersedia;
* authorization benar;
* tidak ada regression yang diketahui;
* documentation diperbarui jika diperlukan;
* diff direview.

---

# 26. Forbidden

Jangan:

* hard-code user ID;
* expose secrets;
* bypass RLS;
* trust client amount;
* menggunakan `any` sembarangan;
* membuat destructive migration tanpa review;
* menghapus feature existing tanpa approval;
* menambahkan payment integration tanpa explicit task;
* mengubah stack;
* mengganti database;
* membuat microservices;
* menginstall dependency besar tanpa alasan;
* menganggap QRIS sebagai saldo internal Duitku.

---

# 27. Priority

Jika terjadi konflik:

```text
Security
>
Data Integrity
>
Correctness
>
PRD
>
Architecture
>
Design
>
Developer Convenience
```

AI harus memilih solusi yang menjaga data dan keamanan user terlebih dahulu.
