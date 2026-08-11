# Duitku — Product & UI Design Specification

**Version:** 1.0
**Status:** Source of Truth

---

# 1. Design Philosophy

Duitku harus terasa:

* sederhana;
* modern;
* trustworthy;
* ringan;
* tidak intimidating;
* cepat digunakan.

Prinsip utama:

> User harus bisa mencatat transaksi baru dalam beberapa detik.

Jangan membuat aplikasi keuangan terasa seperti software accounting enterprise.

---

# 2. Primary Navigation

Desktop:

```text
┌──────────────────────┐
│ DUITKU               │
│                      │
│ 🏠 Dashboard         │
│ 💳 Transactions      │
│ 👛 Wallets           │
│ 🏷 Categories        │
│ 📊 Reports           │
│                      │
│ ⚙ Settings           │
│                      │
│ 👤 Profile           │
└──────────────────────┘
```

Mobile/responsive:

```text
Bottom Navigation

Home | Transactions | + | Wallets | More
```

Mobile application bukan scope platform terpisah, tetapi web harus responsive.

---

# 3. Pages

## Public

### Landing Page

Route:

```text
/
```

Content:

* Duitku introduction
* Problem
* Main benefits
* Feature overview
* Free/Premium overview
* CTA Register
* Login

---

### Login

```text
/login
```

Elements:

* Email
* Password
* Login button
* Google login jika diaktifkan
* Forgot password
* Register link

---

### Register

```text
/register
```

Elements:

* Name
* Email
* Password
* Confirm password
* Register button

---

# 4. Authenticated Pages

## Dashboard

```text
/dashboard
```

Content:

```text
Total Balance
Income
Expense
Net Cash Flow

Income vs Expense Chart

Expense Breakdown

Recent Transactions

Wallet Summary
```

---

## Transactions

```text
/transactions
```

Elements:

* Search
* Date filter
* Type filter
* Category filter
* Wallet filter
* Sort
* Add Transaction
* Transaction list

---

## Transaction Detail

Conceptual route:

```text
/transactions/[id]
```

Content:

* Type
* Amount
* Category
* Wallet
* Date
* Description
* Created timestamp
* Edit
* Delete

---

## Wallets

```text
/wallets
```

Content:

* Total balance
* Wallet cards
* Add wallet
* Edit wallet
* Delete/deactivate wallet
* Transfer

---

## Categories

```text
/categories
```

Content:

* Income categories
* Expense categories
* Add category
* Edit category
* Delete category

---

## Reports

```text
/reports
```

MVP:

* Income report
* Expense report
* Category breakdown
* Monthly trend

---

## Settings

```text
/settings
```

Content:

* Profile
* Preferences
* Currency
* Account
* Logout

---

# 5. Core User Flow — Add Expense

```text
Dashboard
   ↓
Click "+ Add Transaction"
   ↓
Select Expense
   ↓
Enter amount
   ↓
Select category
   ↓
Select wallet
   ↓
Enter description (optional)
   ↓
Select date
   ↓
Submit
   ↓
Validate
   ↓
Save transaction
   ↓
Update wallet
   ↓
Refresh dashboard
   ↓
Success notification
```

---

# 6. Core User Flow — Add Income

```text
Dashboard
   ↓
Add Transaction
   ↓
Income
   ↓
Amount
   ↓
Category
   ↓
Wallet
   ↓
Description
   ↓
Date
   ↓
Submit
   ↓
Create transaction
   ↓
Increase wallet balance
   ↓
Update dashboard
```

---

# 7. Core User Flow — Transfer

```text
Wallets
   ↓
Transfer
   ↓
Select Source Wallet
   ↓
Select Destination Wallet
   ↓
Amount
   ↓
Description
   ↓
Confirm
   ↓
Validate
   ↓
Decrease Source Wallet
   ↓
Increase Destination Wallet
   ↓
Create Transfer Record
   ↓
Success
```

Important:

Transfer **tidak boleh dihitung sebagai expense/income**.

---

# 8. Core User Flow — Transaction History

```text
Transactions
   ↓
Search / Filter
   ↓
Transaction List
   ↓
Click Transaction
   ↓
Transaction Detail
   ↓
Edit / Delete
```

---

# 9. Design System

## Color

Recommended:

### Primary

Indigo / Blue:

```text
#4F46E5
```

Purpose:

* primary CTA;
* active navigation;
* links.

### Success

```text
#16A34A
```

Income / positive balance.

### Danger

```text
#DC2626
```

Expense / destructive action.

### Warning

```text
#D97706
```

Warnings.

### Neutral

Use Tailwind neutral/slate scale.

Background:

```text
#F8FAFC
```

Surface:

```text
#FFFFFF
```

Text:

```text
#0F172A
```

Secondary:

```text
#64748B
```

---

# 10. Typography

Primary:

**Inter**

Fallback:

```text
system-ui, sans-serif
```

Hierarchy:

```text
H1
32px

H2
24px

H3
20px

Body
14-16px

Caption
12-13px
```

Avoid excessive font sizes.

---

# 11. Spacing

Use Tailwind spacing scale.

Primary spacing:

```text
4
8
12
16
24
32
48
64
```

Card padding:

```text
16px - 24px
```

---

# 12. Border Radius

Recommended:

```text
Buttons: 8px
Inputs: 8px
Cards: 12px
Modal: 12px
```

Avoid excessive rounded/pill UI unless semantically useful.

---

# 13. Components

Reusable components:

```text
Button
Input
Select
DatePicker
Modal
Dialog
Dropdown
Tabs
Card
Badge
Toast
Tooltip
Skeleton
EmptyState
ErrorState
DataTable
Pagination
SearchInput
FilterBar
MoneyDisplay
TransactionItem
WalletCard
CategoryBadge
ConfirmDialog
```

> Nama file mengikuti konvensi `{domain}_{fungsi}.tsx` (mis. `transaction_item.tsx`, `wallet_card.tsx`); daftar di atas adalah nama component (export), bukan nama file.

Domain components:

```text
TransactionForm
TransactionDetail
WalletForm
TransferForm
CategoryForm
DashboardSummary
IncomeExpenseChart
ExpenseBreakdown
RecentTransactions
WalletSummary
```

> Nama file mengikuti konvensi `{domain}_{fungsi}.tsx` (mis. `transaction_form.tsx`, `wallet_form.tsx`); daftar di atas adalah nama component (export), bukan nama file.

---

# 14. Money Display Rules

Income:

```text
+ Rp3.000.000
```

Expense:

```text
- Rp250.000
```

Neutral:

```text
Rp2.500.000
```

Currency formatting harus menggunakan formatter terpusat.

Jangan membuat formatter berbeda-beda di setiap component.

---

# 15. Empty States

## No Transactions

```text
Belum ada transaksi.

Mulai catat pemasukan atau pengeluaran
untuk melihat kondisi keuanganmu.

[+ Tambah Transaksi]
```

---

## No Wallet

```text
Belum ada Wallet.

Tambahkan tempat penyimpanan uangmu
untuk mulai menggunakan Duitku.

[+ Tambah Wallet]
```

---

## No Categories

```text
Belum ada kategori.

Buat kategori agar transaksi lebih
mudah dianalisis.
```

---

# 16. Loading State

Gunakan skeleton untuk:

* dashboard cards;
* chart;
* transaction list;
* wallet cards.

Jangan menampilkan blank page ketika data sedang loading.

---

# 17. Error State

Error harus:

* jelas;
* tidak teknis;
* memberikan tindakan berikutnya.

Bad:

```text
PostgrestError: 23505
```

Good:

```text
Transaksi gagal disimpan.

Silakan coba lagi.
```

Untuk developer, error detail tetap dicatat melalui logging yang sesuai.

---

# 18. Confirmation

Action destructive harus menggunakan confirmation.

Contoh:

```text
Hapus transaksi?

Transaksi Rp50.000 akan dihapus.
Tindakan ini tidak dapat dibatalkan.

[Batal] [Hapus]
```

---

# 19. Form UX

Form transaksi harus memprioritaskan:

```text
Amount
↓
Type
↓
Category
↓
Wallet
↓
Date
↓
Description
```

Amount harus menjadi field paling mudah ditemukan.

Submit button:

```text
Simpan Transaksi
```

Loading:

```text
Menyimpan...
```

---

# 20. Responsive Design

Desktop:

```text
Sidebar + Main Content
```

Tablet:

```text
Collapsible Sidebar
```

Mobile:

```text
Top Bar
+
Bottom Navigation
```

Data table harus berubah menjadi card/list pada layar kecil apabila table menjadi sulit digunakan.

---

# 21. Accessibility

Minimal:

* semantic HTML;
* keyboard navigation;
* visible focus state;
* proper labels;
* sufficient contrast;
* aria-label ketika dibutuhkan;
* button tidak menggunakan `<div>`;
* form error harus dapat dipahami screen reader.

---

# 22. UX Rules

1. Jangan meminta informasi yang tidak diperlukan.
2. Jangan membuat user membuka banyak halaman untuk transaksi sederhana.
3. Jangan menggunakan istilah accounting yang membingungkan.
4. Jangan menghapus data tanpa confirmation.
5. Jangan menampilkan saldo yang stale setelah mutation.
6. Error harus actionable.
7. Loading state harus jelas.
8. Semua halaman authenticated harus konsisten dengan navigation utama.

---

# 23. Animation System (TASK-1005)

## Prinsip

```text
Tailwind/CSS
    ↓
Simple micro interaction

Motion
    ↓
Default UI animation

Rive
    ↓
Interactive/stateful animation (saat asset tersedia)

Lottie
    ↓
Ready-made visual animation (saat dibutuhkan)

GSAP
    ↓
Complex animation / timeline (saat dibutuhkan)
```

## Motion — Default UI Animation

Dipakai untuk: entrance section/kartu, stagger list, animated numbers, dan transisi halus.

Aturan:

1. Gunakan variant terpusat dari `lib/animations/motion.ts` — jangan membuat konfigurasi animasi random di komponen.
2. Animation boundary sekecil mungkin: halaman tetap Server Component, animasi dibungkus komponen client (`<Reveal>`, `AnimatedRupiah`, dll).
3. Durasi default: 0.3–0.4s, easing `easeOut` — halus, tidak dramatis.
4. Animasi entrance berjalan satu kali (`whileInView` + `once: true`) — tidak berulang.
5. **Aksesibilitas:** semua animasi hormati `prefers-reduced-motion` (MotionConfig `reducedMotion="user"` + `useReducedMotion`). Informasi penting tidak boleh hanya disampaikan lewat animasi.

## Rive / Lottie / GSAP

Belum diintegrasikan (ADR-014).

* **Rive:** untuk empty-state illustration / visual interaktif — butuh asset `.riv`.
* **Lottie:** untuk success/error/loading ready-made — butuh asset `.json/.lottie` (taruh di `public/animations/`).
* **GSAP:** untuk landing page timeline / scroll animation.
