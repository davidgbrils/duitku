import { describe, expect, it } from "vitest";

import {
  extractReceipt,
  parseAmount,
  parseDate,
} from "../../../lib/receipt/extract";

describe("parseAmount", () => {
  it("mengurai ribuan titik ala Indonesia", () => {
    expect(parseAmount("27.000")).toBe(27000);
    expect(parseAmount("5.000")).toBe(5000);
  });

  it("mengurai angka polos dan desimal titik", () => {
    expect(parseAmount("5000")).toBe(5000);
    expect(parseAmount("27000.5")).toBe(27000.5);
  });

  it("mengurai ribuan koma dan desimal koma", () => {
    expect(parseAmount("1.234,56")).toBe(1234.56);
    expect(parseAmount("27000,50")).toBe(27000.5);
  });

  it("mengabaikan prefiks Rp dan spasi", () => {
    expect(parseAmount("Rp 27.000")).toBe(27000);
  });

  it("menolak input non-angka dan nol", () => {
    expect(parseAmount("abc")).toBeNull();
    expect(parseAmount("0")).toBeNull();
    expect(parseAmount("")).toBeNull();
  });
});

describe("parseDate", () => {
  it("mengurai DD/MM/YYYY", () => {
    expect(parseDate("11/08/2026")).toBe("2026-08-11");
  });

  it("mengurai DD-MM-YY dan menganggap tahun 2 digit sebagai 20xx", () => {
    expect(parseDate("11-08-26")).toBe("2026-08-11");
    expect(parseDate("18-08-26")).toBe("2026-08-18");
  });

  it("mengurai DD/MM/YY format (umum di struk Indonesia)", () => {
    expect(parseDate("18/08/26")).toBe("2026-08-18");
    expect(parseDate("15/12/25")).toBe("2025-12-15");
    expect(parseDate("01/01/27")).toBe("2027-01-01");
  });

  it("mengurai DD.MM.YY format (dengan titik)", () => {
    expect(parseDate("18.08.26")).toBe("2026-08-18");
    expect(parseDate("25.12.25")).toBe("2025-12-25");
  });

  it("mengoreksi urutan MM/DD bila hari > 12", () => {
    expect(parseDate("08/15/2026")).toBe("2026-08-15");
  });

  it("mengurai nama bulan Indonesia", () => {
    expect(parseDate("11 Agustus 2026")).toBe("2026-08-11");
  });

  it("menolak tanggal tidak valid", () => {
    expect(parseDate("99/99/2026")).toBeNull();
  });
});

describe("extractReceipt", () => {
  it("mengurai struk Indomaret contoh", () => {
    const result = extractReceipt(`INDOMARET
11/08/2026

AQUA          5.000
ROTI         12.000
MIE          10.000
-------------------
TOTAL        27.000`);

    expect(result.merchantName).toContain("Indomaret");
    expect(result.transactionDate).toBe("2026-08-11");
    expect(result.totalAmount).toBe(27000);
    expect(result.currency).toBe("IDR");
    expect(result.items).toEqual([
      { name: "AQUA", amount: 5000 },
      { name: "ROTI", amount: 12000 },
      { name: "MIE", amount: 10000 },
    ]);
    expect(result.confidence.total).toBeGreaterThan(0.9);
    expect(result.confidence.date).toBe(0.97);
    expect(result.confidence.merchant).toBeGreaterThanOrEqual(0.96);
  });

  it("tidak menganggap baris TOTAL sebagai item", () => {
    const result = extractReceipt(`TOKO ABC
TOTAL 10.000`);
    expect(result.items).toHaveLength(0);
    expect(result.totalAmount).toBe(10000);
  });

  it("fallback total dari penjumlahan item bila tidak ada baris total", () => {
    const result = extractReceipt(`WARUNG
Nasi 5.000
Ayam 12.000`);
    expect(result.totalAmount).toBe(17000);
    expect(result.confidence.total).toBe(0.8);
  });

  it("mendeteksi metode pembayaran QRIS dan Tunai", () => {
    expect(
      extractReceipt(`INDOMARET
TOTAL 27.000
QRIS`).paymentMethod
    ).toBe("QRIS");
    expect(
      extractReceipt(`INDOMARET
TUNAI
TOTAL 27.000`).paymentMethod
    ).toBe("Tunai");
  });

  it("menangkap qty pada pola 'NAMA <qty> <harga>'", () => {
    const result = extractReceipt(`MINIMARKET
Indomie 2 7.000`);
    expect(result.items).toEqual([
      { name: "Indomie", quantity: 2, amount: 7000 },
    ]);
  });

  it("merchant null dan confidence 0 bila teks tidak terbaca", () => {
    const result = extractReceipt("---\n123\n---");
    expect(result.merchantName).toBeNull();
    expect(result.confidence.merchant).toBe(0);
    expect(result.totalAmount).toBeNull();
  });

  it("mengurai struk Indomaret dengan voucher dan pola 4-kolom (contoh receipt.jpeg)", () => {
    const raw = `PT INDOMARCO PRISMATAMA
GEDUNG MENARA
INDOMARET BOULEVARD
PANTAI INDAH KAPUK
JAKARTA UTARA
NPWP 001.337.994.6-092.000

DURI KOSAMBI 18
JL. RAYA DURI KOSAMBI NO 18 DURI KOSAMBI
KEC. CENGKARENG, KOTA JAKARTA BARAT, 11750
---------------------------------------
04.08.26-19:50/4.3.1/TZZA-936349/FADIL/01
---------------------------------------
GIV BW MLB&CLG PC400 1 19800 19,800
VOUCHER : (4,300)
RXNA MEN INV+A.BC 45 1 28900 28,900
VOUCHER : (6,000)
---------------------------------------
TOTAL BELANJA : 38,400
---------------------------------------
TUNAI : 50,000
KEMBALI : 11,600
ANDA HEMAT : 10,300
PPN : DPP= 40,218 PPN= 4,826
HARGA JUAL : 43,874
LAYANAN KONSUMEN
SMS/WA0811.1500.280 TELP 1500280
KONTAK@INDOMARET.CO.ID`;

    const result = extractReceipt(raw);

    expect(result.merchantName).toContain("Indomaret");
    expect(result.transactionDate).toBe("2026-08-04");
    expect(result.totalAmount).toBe(38400);
    expect(result.paymentMethod).toBe("Tunai");
    expect(result.items).toEqual([
      { name: "GIV BW MLB&CLG PC400", quantity: 1, amount: 19800 },
      { name: "RXNA MEN INV+A.BC 45", quantity: 1, amount: 28900 },
    ]);
  });
});
