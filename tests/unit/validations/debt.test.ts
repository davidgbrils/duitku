import { describe, expect, it } from "vitest";

import { debtPaymentSchema, debtSchema } from "../../../lib/validations/debt";

describe("debtSchema", () => {
  it("passes for valid debt inputs", () => {
    const result = debtSchema.safeParse({
      lenderName: "Bank BCA",
      amount: "5000000",
      dueDate: "2026-12-31",
      notes: "Pinjaman modal kerja",
    });
    expect(result.success).toBe(true);
  });

  it("fails when lenderName is too short", () => {
    const result = debtSchema.safeParse({
      lenderName: "A",
      amount: "100000",
    });
    expect(result.success).toBe(false);
  });

  it("fails when amount is 0 or negative", () => {
    const result = debtSchema.safeParse({
      lenderName: "Teman Kantor",
      amount: "0",
    });
    expect(result.success).toBe(false);
  });
});

describe("debtPaymentSchema", () => {
  it("passes for valid payment input", () => {
    const result = debtPaymentSchema.safeParse({
      debtId: "123e4567-e89b-12d3-a456-426614174000",
      walletId: "123e4567-e89b-12d3-a456-426614174001",
      amount: "500000",
      paymentDate: "2026-08-12",
      notes: "Cicilan ke-1",
    });
    expect(result.success).toBe(true);
  });

  it("fails for invalid debtId UUID", () => {
    const result = debtPaymentSchema.safeParse({
      debtId: "invalid-uuid",
      walletId: "123e4567-e89b-12d3-a456-426614174001",
      amount: "500000",
      paymentDate: "2026-08-12",
    });
    expect(result.success).toBe(false);
  });
});
