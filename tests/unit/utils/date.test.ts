import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatDateTime,
  formatMonthShort,
  lastMonths,
  toLocalIso,
} from "../../../lib/utils/date";

describe("formatDate", () => {
  it("memformat tanggal ISO ke Bahasa Indonesia", () => {
    expect(formatDate("2026-08-11")).toBe("11 Agustus 2026");
  });

  it("mengembalikan input jika tanggal tidak valid", () => {
    expect(formatDate("bukan-tanggal")).toBe("bukan-tanggal");
  });
});

describe("formatDateTime", () => {
  it("memformat datetime ISO", () => {
    const result = formatDateTime("2026-08-11T14:30:00");
    expect(result).toContain("11 Agustus 2026");
  });
});

describe("toLocalIso", () => {
  it("mengembalikan format YYYY-MM-DD", () => {
    expect(toLocalIso(new Date(2026, 7, 11))).toBe("2026-08-11");
  });

  it("menangani bulan dengan padding nol", () => {
    expect(toLocalIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("formatMonthShort", () => {
  it("memformat kunci bulan ke label singkat", () => {
    expect(formatMonthShort("2026-08")).toBe("Agt 26");
  });
});

describe("lastMonths", () => {
  it("mengembalikan 6 bulan terakhir secara berurutan", () => {
    const now = new Date(2026, 7, 11); // Agustus 2026
    const months = lastMonths(6, now);
    expect(months).toEqual([
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
  });

  it("menangani pergantian tahun", () => {
    const now = new Date(2026, 0, 15); // Januari 2026
    const months = lastMonths(3, now);
    expect(months).toEqual(["2025-11", "2025-12", "2026-01"]);
  });
});
