import { describe, expect, it } from "vitest";

import {
  createTransactionSchema,
  NO_CATEGORY_VALUE,
  updateTransactionSchema,
} from "../../../lib/validations/transaction";

const VALID_ID = "11111111-1111-4111-8111-111111111111";

const validInput = {
  type: "income",
  walletId: VALID_ID,
  categoryId: VALID_ID,
  amount: "1500000",
  description: "Gaji bulanan",
  transactionDate: "2026-08-11",
};

describe("createTransactionSchema", () => {
  it("menerima input income yang valid", () => {
    const result = createTransactionSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("menerima input expense yang valid", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      type: "expense",
    });
    expect(result.success).toBe(true);
  });

  it("menolak tipe selain income/expense", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      type: "transfer",
    });
    expect(result.success).toBe(false);
  });

  it("menolak nominal negatif / bukan angka", () => {
    const negative = createTransactionSchema.safeParse({
      ...validInput,
      amount: "-1000",
    });
    expect(negative.success).toBe(false);

    const letters = createTransactionSchema.safeParse({
      ...validInput,
      amount: "abc",
    });
    expect(letters.success).toBe(false);
  });

  it("menolak nominal dengan lebih dari 2 desimal", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      amount: "1000.123",
    });
    expect(result.success).toBe(false);
  });

  it("menolak wallet yang bukan UUID", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      walletId: "bukan-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("menerima kategori tanpa kategori (sentinel)", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      categoryId: NO_CATEGORY_VALUE,
    });
    expect(result.success).toBe(true);
  });

  it("menolak tanggal dengan format salah", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      transactionDate: "11/08/2026",
    });
    expect(result.success).toBe(false);
  });

  it("menolak deskripsi lebih dari 500 karakter", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      description: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTransactionSchema", () => {
  it("menerima input edit yang valid (termasuk id)", () => {
    const result = updateTransactionSchema.safeParse({
      ...validInput,
      id: VALID_ID,
    });
    expect(result.success).toBe(true);
  });

  it("menolak id yang bukan UUID", () => {
    const result = updateTransactionSchema.safeParse({
      ...validInput,
      id: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
