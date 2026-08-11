import { describe, expect, it } from "vitest";

import {
  createTransferSchema,
  updateTransferSchema,
} from "../../../lib/validations/transfer";

const WALLET_A = "11111111-1111-4111-8111-111111111111";
const WALLET_B = "22222222-2222-4222-8222-222222222222";

const validInput = {
  sourceWalletId: WALLET_A,
  destinationWalletId: WALLET_B,
  amount: "250000",
  description: "Tarik tunai",
  transferDate: "2026-08-11",
};

describe("createTransferSchema", () => {
  it("menerima transfer antar wallet berbeda", () => {
    expect(createTransferSchema.safeParse(validInput).success).toBe(true);
  });

  it("menolak wallet asal = tujuan", () => {
    const result = createTransferSchema.safeParse({
      ...validInput,
      destinationWalletId: WALLET_A,
    });
    expect(result.success).toBe(false);
  });

  it("menolak nominal nol atau negatif", () => {
    const zero = createTransferSchema.safeParse({
      ...validInput,
      amount: "0",
    });
    expect(zero.success).toBe(false);

    const negative = createTransferSchema.safeParse({
      ...validInput,
      amount: "-1000",
    });
    expect(negative.success).toBe(false);
  });

  it("menolak wallet yang bukan UUID", () => {
    const result = createTransferSchema.safeParse({
      ...validInput,
      sourceWalletId: "bukan-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("menolak tanggal dengan format salah", () => {
    const result = createTransferSchema.safeParse({
      ...validInput,
      transferDate: "2026/08/11",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTransferSchema", () => {
  it("menerima input edit yang valid", () => {
    const result = updateTransferSchema.safeParse({
      ...validInput,
      id: WALLET_A,
    });
    expect(result.success).toBe(true);
  });

  it("menolak wallet asal = tujuan pada edit", () => {
    const result = updateTransferSchema.safeParse({
      ...validInput,
      id: WALLET_A,
      destinationWalletId: WALLET_A,
    });
    expect(result.success).toBe(false);
  });
});
