import { describe, expect, it } from "vitest";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../../../lib/validations/category";

const VALID_ID = "11111111-1111-4111-8111-111111111111";

describe("createCategorySchema", () => {
  it("menerima input valid", () => {
    const result = createCategorySchema.safeParse({
      name: "Gaji",
      type: "income",
    });
    expect(result.success).toBe(true);
  });

  it("menolak nama kosong", () => {
    const result = createCategorySchema.safeParse({
      name: "   ",
      type: "income",
    });
    expect(result.success).toBe(false);
  });

  it("menolak nama lebih dari 100 karakter", () => {
    const result = createCategorySchema.safeParse({
      name: "x".repeat(101),
      type: "income",
    });
    expect(result.success).toBe(false);
  });

  it("menolak tipe selain income/expense", () => {
    const result = createCategorySchema.safeParse({
      name: "Gaji",
      type: "saving",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCategorySchema", () => {
  it("menerima input edit yang valid", () => {
    const result = updateCategorySchema.safeParse({
      id: VALID_ID,
      name: "Bonus",
      type: "income",
    });
    expect(result.success).toBe(true);
  });

  it("menolak id yang bukan UUID", () => {
    const result = updateCategorySchema.safeParse({
      id: "invalid",
      name: "Bonus",
      type: "income",
    });
    expect(result.success).toBe(false);
  });
});
