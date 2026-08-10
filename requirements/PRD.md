# Duitku — Product Requirements Document

**Version:** 1.0
**Status:** Draft / Source of Truth
**Product:** Duitku
**Platform:** Web Application
**Primary Stack:** Next.js, TypeScript, Supabase, PostgreSQL
**Business Model:** Freemium
**Project Stage:** MVP sudah tersedia, dilanjutkan ke pengembangan berikutnya
**Development Model:** Solo Developer, budget minim, fokus portfolio

---

## 1. Product Overview

**Duitku** adalah aplikasi web personal finance yang membantu pengguna mencatat, mengelola, dan memahami kondisi keuangan mereka dalam satu tempat.

Duitku berfokus pada pencatatan pemasukan, pengeluaran, saldo berbagai wallet, kategori transaksi, transfer antar-wallet, riwayat transaksi, serta ringkasan kondisi keuangan.

Visi jangka panjang Duitku adalah berkembang menjadi platform financial management yang lebih lengkap, termasuk hutang/piutang, budgeting, financial insights, dan pada fase yang jauh lebih lanjut integrasi pembayaran seperti QRIS.

---

# 2. Problem Statement

Banyak pengguna masih mencatat keuangan secara:

* manual di notes;
* spreadsheet;
* aplikasi berbeda-beda;
* atau bahkan tidak mencatat sama sekali.

Akibatnya pengguna sulit menjawab pertanyaan sederhana seperti:

* Berapa uang saya sebenarnya?
* Berapa pengeluaran saya bulan ini?
* Pengeluaran terbesar saya apa?
* Uang saya berada di mana saja?
* Berapa pemasukan bersih bulan ini?
* Transaksi apa yang menyebabkan saldo berkurang?
* Apakah pengeluaran saya meningkat dibanding periode sebelumnya?

Duitku menyelesaikan masalah tersebut dengan menyediakan satu sistem terpusat untuk pencatatan dan pemantauan keuangan pribadi.

---

# 3. Target User

## Primary Target

Duitku ditujukan untuk **pengguna umum yang ingin mengelola keuangan pribadi**.

Contohnya:

* mahasiswa;
* pekerja entry-level;
* freelancer;
* pekerja kantoran;
* entrepreneur kecil;
* pengguna yang memiliki beberapa rekening/e-wallet;
* pengguna yang ingin mulai disiplin mencatat keuangan.

Duitku tidak membatasi aplikasi hanya untuk mahasiswa atau UMKM.

---

# 4. User Pain Points

### P1 — Tidak tahu kondisi saldo sebenarnya

User memiliki uang di beberapa tempat tetapi sulit melihat totalnya.

Contoh:

* Cash: Rp300.000
* BCA: Rp2.000.000
* DANA: Rp250.000

User ingin melihat total secara cepat.

---

### P2 — Pengeluaran sulit dilacak

User tahu uang berkurang tetapi tidak tahu digunakan untuk apa.

---

### P3 — Tidak memiliki riwayat transaksi yang terstruktur

User kesulitan mencari transaksi tertentu berdasarkan tanggal, kategori, wallet, atau nominal.

---

### P4 — Pencatatan terasa merepotkan

Aplikasi harus membuat pencatatan transaksi sesederhana mungkin.

---

### P5 — Sulit memahami pola pengeluaran

User membutuhkan dashboard dan laporan sederhana untuk memahami pola keuangannya.

---

# 5. Product Goals

## Goal 1 — Centralized Finance Tracking

User dapat mencatat pemasukan dan pengeluaran dalam satu aplikasi.

## Goal 2 — Accurate Wallet Balance

Saldo setiap Wallet dapat diperbarui berdasarkan Transaction.

## Goal 3 — Easy Transaction History

User dapat menemukan transaksi dengan cepat.

## Goal 4 — Financial Visibility

User dapat melihat:

* total balance;
* total income;
* total expense;
* net cash flow;
* breakdown berdasarkan kategori.

## Goal 5 — Portfolio Quality

Duitku harus menjadi project portfolio yang menunjukkan kemampuan:

* frontend development;
* backend development;
* database design;
* authentication;
* business logic;
* data visualization;
* testing;
* deployment;
* software architecture.

---

# 6. Non-Goals

Fitur berikut **bukan bagian dari MVP core**:

* QRIS;
* payment processing;
* withdraw dana;
* bank account integration;
* open banking;
* cryptocurrency;
* investment trading;
* lending;
* insurance;
* AI financial advisor;
* mobile application;
* marketplace;
* accounting untuk perusahaan;
* payroll;
* tax management kompleks.

Fitur tersebut dapat dipertimbangkan setelah core personal finance stabil.

---

# 7. MVP Scope

## Must Have

### Authentication

* Register
* Login
* Logout
* Session management
* Protected application routes
* User profile dasar

### Wallet

* Create Wallet
* Read Wallet
* Update Wallet
* Delete Wallet
* View Wallet balance
* Total balance

### Category

* Default categories
* Create Category
* Edit Category
* Delete Category
* Income Category
* Expense Category

### Transaction

* Create Income
* Create Expense
* Edit Transaction
* Delete Transaction
* View Transaction Detail
* Transaction date
* Amount
* Category
* Wallet
* Description

### Transfer

* Transfer antar-Wallet
* Source Wallet
* Destination Wallet
* Transfer amount
* Transfer history

### Dashboard

* Total Balance
* Total Income
* Total Expense
* Net Cash Flow
* Recent Transactions
* Expense breakdown
* Income vs Expense

### History

* Transaction list
* Search
* Filter
* Sort
* Pagination
* Transaction detail

---

# 8. Nice To Have

Fitur berikut dapat dikembangkan setelah MVP core stabil:

### Debt

* Create Debt
* Debt payment
* Remaining debt
* Due date
* Debt status

### Receivable

* Create Receivable
* Payment
* Remaining receivable
* Due date
* Receivable status

### Budget

* Monthly budget
* Category budget
* Budget progress
* Budget warning

### Reports

* Monthly report
* Yearly report
* Category breakdown
* Cash flow report

### Export

* CSV
* PDF

---

# 9. Future Features

Tahap lebih lanjut:

* Receipt upload
* OCR receipt
* Recurring transactions
* Financial goals
* Advanced financial analytics
* AI financial insights
* Notifications
* Subscription management
* Premium features

Tahap jauh:

* QRIS
* Payment gateway
* Payment receiving
* Settlement
* Withdraw
* Bank integration

Fitur payment **tidak boleh diasumsikan sebagai bagian dari core Wallet pada MVP**.

---

# 10. Core User Stories

## Authentication

> Sebagai User, saya ingin membuat akun supaya data keuangan saya tersimpan secara pribadi.

> Sebagai User, saya ingin login supaya dapat mengakses data keuangan saya.

---

## Wallet

> Sebagai User, saya ingin membuat Wallet supaya saya dapat memisahkan uang berdasarkan tempat penyimpanannya.

> Sebagai User, saya ingin melihat saldo setiap Wallet supaya saya mengetahui posisi uang saya.

> Sebagai User, saya ingin melihat total saldo supaya saya mengetahui total aset kas yang tercatat.

---

## Transaction

> Sebagai User, saya ingin mencatat pemasukan supaya saldo dan riwayat keuangan saya akurat.

> Sebagai User, saya ingin mencatat pengeluaran supaya saya mengetahui ke mana uang saya digunakan.

> Sebagai User, saya ingin mengedit transaksi supaya kesalahan pencatatan dapat diperbaiki.

> Sebagai User, saya ingin melihat detail transaksi supaya saya dapat memahami transaksi tertentu.

---

## Category

> Sebagai User, saya ingin mengelompokkan transaksi berdasarkan kategori supaya saya dapat menganalisis pengeluaran.

---

## Transfer

> Sebagai User, saya ingin memindahkan uang antar-Wallet supaya saldo setiap Wallet tetap sesuai kondisi sebenarnya.

---

## History

> Sebagai User, saya ingin mencari transaksi supaya saya dapat menemukan transaksi tertentu dengan cepat.

> Sebagai User, saya ingin memfilter transaksi berdasarkan kategori, Wallet, tipe, dan tanggal supaya riwayat lebih mudah dianalisis.

---

## Dashboard

> Sebagai User, saya ingin melihat ringkasan keuangan supaya saya dapat memahami kondisi keuangan tanpa membuka transaksi satu per satu.

---

# 11. Business Model

Duitku menggunakan model **Freemium**.

## Free

Fokus pada kebutuhan dasar:

* Authentication
* Wallet terbatas
* Transaction
* Category
* Dashboard
* History
* Basic reports

## Premium

Dapat mencakup:

* Unlimited Wallet
* Advanced reports
* Budgeting
* Financial goals
* Export
* OCR
* Advanced analytics
* AI insights
* Recurring transactions

Detail pricing belum dikunci dalam MVP.

---

# 12. Success Metrics

## Product Metrics

### Activation

Persentase user baru yang:

1. membuat akun;
2. membuat Wallet;
3. membuat Transaction pertama.

Target awal:

**≥ 60% user baru mencapai transaction pertama.**

---

### Transaction Adoption

Persentase active users yang mencatat minimal satu transaksi dalam 7 hari.

Target awal:

**≥ 40%.**

---

### Retention

Target awal:

* Week 1 retention ≥ 30%
* Month 1 retention ≥ 15%

Target dapat dievaluasi setelah mendapatkan user nyata.

---

### Transaction Completion

Minimal **95% transaksi valid berhasil tersimpan tanpa error**.

---

### Performance

Target:

* halaman utama terasa cepat;
* API/query utama < 500 ms pada kondisi normal;
* tidak ada error blocking pada flow utama.

---

### Reliability

Target:

**≥ 99% successful request rate** untuk operasi inti pada environment production.

---

# 13. MVP Definition of Done

MVP dianggap selesai jika User dapat:

1. Register.
2. Login.
3. Membuat Wallet.
4. Membuat Category.
5. Mencatat Income.
6. Mencatat Expense.
7. Melakukan Transfer.
8. Melihat saldo.
9. Melihat dashboard.
10. Melihat transaction history.
11. Search/filter transaction.
12. Membuka transaction detail.
13. Edit transaction.
14. Delete transaction.
15. Logout.

Seluruh flow tersebut harus:

* memiliki validation;
* memiliki error handling;
* memiliki loading state;
* memiliki empty state;
* memiliki authorization berdasarkan User;
* memiliki test untuk business logic penting;
* dapat berjalan pada production deployment.

---

# 14. Product Principle

Duitku harus mengikuti prinsip:

> **Simple to record, easy to understand, reliable to trust.**

Prioritas pengembangan:

**Correctness > Security > Usability > Performance > Feature count.**
