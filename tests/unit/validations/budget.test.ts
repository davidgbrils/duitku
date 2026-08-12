import { describe, expect, it } from "vitest";

import { budgetSchema } from "../../../lib/validations/budget";

describe("budgetSchema", () => {
  it("passes for valid budget inputs", () => {
    const result = budgetSchema.safeParse({
      categoryId: "123e4567-e89b-12d3-a456-426614174000",
      amountLimit: "2500000",
      monthYear: "2026-08",
    });
    expect(result.success).toBe(true);
  });

  it("fails when monthYear has invalid format", () => {
    const result = budgetSchema.safeParse({
      categoryId: "123e4567-e89b-12d3-a456-426614174000",
      amountLimit: "2500000",
      monthYear: "2026-8",
    });
    expect(result.success).toBe(false);
  });

  it("fails when amountLimit is 0", () => {
    const result = budgetSchema.safeParse({
      categoryId: "123e4567-e89b-12d3-a456-426614174000",
      amountLimit: "0",
      monthYear: "2026-08",
    });
    expect(result.success).toBe(false);
  });
});
