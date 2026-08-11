import { describe, expect, it } from "vitest";

import {
  formatRupiah,
  formatRupiahZero,
  formatSignedRupiah,
  parseRupiahInput,
} from "../../../lib/utils/money";

describe("formatRupiah", () => {
  it("memformat 0 sebagai Rp0", () => {
    expect(formatRupiah(0)).toBe("Rp0");
  });

  it("memformat jutaan dengan pemisah ribuan", () => {
    expect(formatRupiah(3_000_000)).toBe("Rp3.000.000");
  });

  it("memformat nilai desimal", () => {
    expect(formatRupiah(250_500)).toBe("Rp250.500");
  });

  it("mengembalikan '-' untuk null/undefined", () => {
    expect(formatRupiah(null)).toBe("-");
    expect(formatRupiah(undefined)).toBe("-");
  });
});

describe("formatRupiahZero", () => {
  it("menampilkan Rp0 untuk 0/null/undefined", () => {
    expect(formatRupiahZero(0)).toBe("Rp0");
    expect(formatRupiahZero(null)).toBe("Rp0");
    expect(formatRupiahZero(undefined)).toBe("Rp0");
  });

  it("menampilkan nilai normal untuk angka bukan nol", () => {
    expect(formatRupiahZero(100_000)).toBe("Rp100.000");
  });
});

describe("formatSignedRupiah", () => {
  it("income → tanda plus", () => {
    expect(formatSignedRupiah(3_000_000, true)).toBe("+ Rp3.000.000");
  });

  it("expense → tanda minus", () => {
    expect(formatSignedRupiah(250_000, false)).toBe("- Rp250.000");
  });

  it("menggunakan nilai absolut", () => {
    expect(formatSignedRupiah(-250_000, false)).toBe("- Rp250.000");
  });
});

describe("parseRupiahInput", () => {
  it("parse angka dengan pemisah ribuan", () => {
    expect(parseRupiahInput("1.500.000")).toBe(1_500_000);
  });

  it("parse angka polos", () => {
    expect(parseRupiahInput("1500000")).toBe(1_500_000);
  });

  it("mengembalikan null untuk input kosong", () => {
    expect(parseRupiahInput("")).toBeNull();
  });

  it("mengembalikan null untuk input non-angka", () => {
    expect(parseRupiahInput("abc")).toBeNull();
  });
});
