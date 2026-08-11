import { describe, expect, it } from "vitest";

import {
  createWalletSchema,
  updateWalletSchema,
} from "../../../lib/validations/wallet";

const VALID_ID = "11111111-1111-4111-8111-111111111111";

const validInput = {
  name: "Cash",
  type: "cash",
  currency: "IDR",
  initialBalance: "500000",
};

describe("createWalletSchema", () => {
  it("menerima input valid", () => {
    expect(createWalletSchema.safeParse(validInput).success).toBe(true);
  });

  it("menerima semua tipe wallet", () => {
    for (const type of ["cash", "bank", "ewallet", "other"]) {
      expect(
        createWalletSchema.safeParse({ ...validInput, type }).success
      ).toBe(true);
    }
  });

  it("menolak nama kosong", () => {
    const result = createWalletSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
  });

  it("menolak nama lebih dari 100 karakter", () => {
    const result = createWalletSchema.safeParse({
      ...validInput,
      name: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("menolak currency bukan 3 huruf", () => {
    const short = createWalletSchema.safeParse({
      ...validInput,
      currency: "ID",
    });
    expect(short.success).toBe(false);

    const digits = createWalletSchema.safeParse({
      ...validInput,
      currency: "ID1",
    });
    expect(digits.success).toBe(false);
  });

  it("menolak saldo awal negatif", () => {
    const result = createWalletSchema.safeParse({
      ...validInput,
      initialBalance: "-1000",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateWalletSchema", () => {
  it("menerima input edit yang valid", () => {
    const result = updateWalletSchema.safeParse({
      ...validInput,
      id: VALID_ID,
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it("menolak id yang bukan UUID", () => {
    const result = updateWalletSchema.safeParse({
      ...validInput,
      id: "bukan-uuid",
      isActive: true,
    });
    expect(result.success).toBe(false);
  });
});
