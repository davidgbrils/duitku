import { describe, expect, it } from "vitest";

import {
  receivablePaymentSchema,
  receivableSchema,
} from "../../../lib/validations/receivable";

describe("receivableSchema", () => {
  it("passes for valid receivable inputs", () => {
    const result = receivableSchema.safeParse({
      borrowerName: "Andi Wijaya",
      amount: "1500000",
      dueDate: "2026-09-30",
      notes: "Pinjaman uang kuliah",
    });
    expect(result.success).toBe(true);
  });

  it("fails when borrowerName is empty", () => {
    const result = receivableSchema.safeParse({
      borrowerName: " ",
      amount: "500000",
    });
    expect(result.success).toBe(false);
  });

  it("fails when amount is invalid string", () => {
    const result = receivableSchema.safeParse({
      borrowerName: "Budi",
      amount: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("receivablePaymentSchema", () => {
  it("passes for valid receivable payment input", () => {
    const result = receivablePaymentSchema.safeParse({
      receivableId: "123e4567-e89b-12d3-a456-426614174000",
      walletId: "123e4567-e89b-12d3-a456-426614174001",
      amount: "250000",
      paymentDate: "2026-08-12",
    });
    expect(result.success).toBe(true);
  });
});
