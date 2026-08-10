# Duitku — Architecture Decision Records

---

## ADR-001: Menggunakan Next.js sebagai Application Framework

* **Tanggal:** 2026-08-10
* **Status:** Diterima

### Konteks

Duitku membutuhkan web application yang dapat menangani UI, server-side logic, authentication integration, dan deployment sederhana.

Project dikerjakan solo developer dengan budget minim dan tujuan utama portfolio.

### Opsi yang dipertimbangkan

1. Laravel + Livewire
2. Next.js + TypeScript
3. Next.js frontend + backend service terpisah

### Keputusan final

Menggunakan:

```text
Next.js + TypeScript
```

### Alasan

* full-stack web framework;
* cocok untuk React;
* TypeScript meningkatkan type safety;
* ecosystem luas;
* cocok untuk portfolio;
* mudah di-deploy ke Vercel;
* dapat menangani frontend dan server-side logic tanpa backend terpisah.

### Konsekuensi

* developer harus memahami React dan Next.js;
* architecture harus menjaga agar server/client boundary tetap jelas;
* jangan mengubah project menjadi microservices terlalu awal.

---

## ADR-002: Menggunakan Supabase + PostgreSQL

* **Tanggal:** 2026-08-10
* **Status:** Diterima

### Konteks

Duitku membutuhkan database relational dan authentication tetapi project dikerjakan solo dengan budget minim.

### Opsi

1. PostgreSQL self-hosted
2. MySQL
3. MongoDB
4. Supabase PostgreSQL

### Keputusan final

Menggunakan:

```text
Supabase
+
PostgreSQL
```

### Alasan

* PostgreSQL cocok dengan relational financial data;
* Supabase menyediakan hosted PostgreSQL;
* Supabase Auth tersedia;
* RLS tersedia;
* development setup relatif cepat;
* biaya awal rendah.

### Konsekuensi

* project memiliki dependency terhadap Supabase;
* developer harus memahami RLS;
* migration harus dikelola dengan disiplin.

---

## ADR-003: Modular Monolith, Bukan Microservices

* **Tanggal:** 2026-08-10
* **Status:** Diterima

### Konteks

Duitku dikerjakan oleh solo developer.

Microservices akan menambah:

* infrastructure;
* deployment complexity;
* observability;
* network failure;
* operational overhead.

### Keputusan final

Duitku menggunakan **modular monolith**.

### Alasan

Core feature masih berada dalam satu bounded domain: personal finance.

### Konsekuensi

Architecture harus tetap modular agar future extraction memungkinkan jika benar-benar diperlukan.

---

## ADR-004: PostgreSQL sebagai Relational Database

* **Tanggal:** 2026-08-10
* **Status:** Diterima

### Konteks

Duitku memiliki hubungan jelas antara:

```text
User
Wallet
Transaction
Category
Transfer
```

### Opsi

* PostgreSQL
* MongoDB

### Keputusan final

PostgreSQL.

### Alasan

* relational integrity;
* foreign key;
* transaction support;
* numeric precision;
* cocok untuk financial records;
* query reporting lebih natural.

### Konsekuensi

Schema harus dirancang secara eksplisit dan migration harus dikelola.

---

## ADR-005: Freemium Business Model

* **Tanggal:** 2026-08-10
* **Status:** Diterima

### Konteks

Duitku ditujukan kepada pengguna umum dan membutuhkan friction rendah untuk mendapatkan user.

### Opsi

1. Pure paid
2. Pure free
3. Freemium
4. Ads-first

### Keputusan final

Freemium.

### Alasan

User dapat mencoba core product tanpa membayar.

Fitur premium dapat digunakan sebagai monetization layer.

### Free

* basic transaction;
* wallet;
* category;
* dashboard;
* history.

### Premium

Dapat mencakup:

* advanced reports;
* unlimited wallets;
* budgeting;
* export;
* OCR;
* AI insights;
* recurring transaction.

### Konsekuensi

Harus ada pemisahan feature entitlement yang jelas ketika subscription mulai diimplementasikan.

---

## ADR-006: QRIS Bukan Bagian dari Core Wallet MVP

* **Tanggal:** 2026-08-10
* **Status:** Diterima

### Konteks

Ide awal Duitku mencakup menerima pembayaran melalui QRIS dan menarik dana ke rekening.

Namun fitur tersebut memiliki kompleksitas jauh lebih tinggi dibanding personal finance tracking.

### Keputusan final

QRIS dan withdrawal berada pada future phase.

### Alasan

MVP harus fokus pada:

```text
Personal Finance
```

bukan payment infrastructure.

### Konsekuensi

Arsitektur saat ini tidak boleh menganggap:

```text
Wallet = stored money managed by Duitku
```

Wallet saat ini hanya merupakan **catatan saldo yang dikelola user berdasarkan transaksi yang dicatat**.

---

## ADR-007: Transfer Dipisahkan dari Income dan Expense

* **Tanggal:** 2026-08-10
* **Status:** Diterima

### Konteks

Memindahkan uang dari BCA ke Cash tidak menghasilkan income maupun expense.

### Keputusan final

Transfer memiliki semantic type tersendiri.

```text
income
expense
transfer
```

### Konsekuensi

Dashboard harus mengecualikan transfer dari perhitungan income/expense.

---

## ADR-008: Financial Operations Harus Atomic

* **Tanggal:** 2026-08-10
* **Status:** Diterima

### Konteks

Financial record harus konsisten.

### Keputusan final

Perubahan transaction dan balance harus atomic.

### Contoh

Expense:

```text
Create Expense
+
Decrease Wallet
```

harus berhasil atau gagal bersama.

### Konsekuensi

Database transaction/RPC diperlukan untuk operation penting.

---

## ADR-009: RLS sebagai Database Security Layer

* **Tanggal:** 2026-08-10
* **Status:** Diterima

### Konteks

Setiap user memiliki data financial pribadi.

### Keputusan final

Supabase PostgreSQL Row Level Security wajib digunakan.

### Alasan

Defense in depth.

Walaupun application layer mengalami bug, database tetap memiliki ownership boundary.

### Konsekuensi

Setiap query dan mutation harus dirancang agar kompatibel dengan RLS.

---

## ADR-010: Mobile App Tidak Dibuat pada Fase Sekarang

* **Tanggal:** 2026-08-10
* **Status:** Diterima

### Konteks

Project dikerjakan solo developer dan fokus pada portfolio.

### Keputusan final

Web responsive menjadi platform utama.

### Konsekuensi

UI harus responsive tetapi tidak ada native Android/iOS application pada fase ini.
