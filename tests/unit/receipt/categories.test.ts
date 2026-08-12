import { describe, expect, it } from "vitest";

import { detectCategory } from "../../../lib/receipt/categories";

const FOOD_ID = "11111111-1111-4111-8111-111111111111";
const DRINK_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_ID = "33333333-3333-4333-8333-333333333333";

const categories = [
  { id: FOOD_ID, name: "Makanan & Kebutuhan", type: "expense" },
  { id: DRINK_ID, name: "Minuman", type: "expense" },
  { id: OTHER_ID, name: "Lainnya", type: "expense" },
  { id: "44444444-4444-4444-8444-444444444444", name: "Gaji", type: "income" },
];

describe("detectCategory", () => {
  it("memilih kategori Makanan untuk AQUA/ROTI/MIE (contoh struk)", () => {
    const result = detectCategory(["AQUA", "ROTI", "MIE"], categories);
    expect(result.categoryId).toBe(FOOD_ID);
    expect(result.categoryName).toBe("Makanan & Kebutuhan");
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it("memilih kategori Minuman untuk item minuman", () => {
    const result = detectCategory(["TEH BOTOL", "SUSU"], categories);
    expect(result.categoryId).toBe(DRINK_ID);
  });

  it("fallback ke kategori 'Lainnya' bila tidak ada keyword cocok", () => {
    const result = detectCategory(["BANTAL", "GORDEN"], categories);
    expect(result.categoryId).toBe(OTHER_ID);
    expect(result.confidence).toBeLessThanOrEqual(0.6);
  });

  it("hanya mempertimbangkan kategori expense (income diabaikan)", () => {
    const result = detectCategory(["Gaji", "Bonus"], categories);
    expect(result.categoryId).toBe(OTHER_ID);
  });

  it("mengembalikan null bila tidak ada kategori expense", () => {
    const result = detectCategory(
      ["ROTI"],
      [{ id: DRINK_ID, name: "Gaji", type: "income" }]
    );
    expect(result.categoryId).toBeNull();
    expect(result.categoryName).toBeNull();
  });

  it("confidence rendah bila kategori user tidak cocok dengan label", () => {
    const result = detectCategory(
      ["ROTI", "MIE"],
      [{ id: OTHER_ID, name: "Kas", type: "expense" }]
    );
    expect(result.categoryId).toBeNull();
    expect(result.confidence).toBeLessThan(0.8);
  });

  it("mendeteksi kategori Kebersihan untuk brand GIV dan REXONA/RXNA", () => {
    const HYGIENE_ID = "55555555-5555-5555-8555-555555555555";
    const customCategories = [
      ...categories,
      { id: HYGIENE_ID, name: "Kebersihan & Perawatan", type: "expense" },
    ];
    const result = detectCategory(
      ["GIV BW MLB&CLG PC400", "RXNA MEN INV+A.BC 45"],
      customCategories
    );
    expect(result.categoryId).toBe(HYGIENE_ID);
    expect(result.categoryName).toBe("Kebersihan & Perawatan");
  });
});
