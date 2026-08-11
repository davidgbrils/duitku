import { z } from "zod";

export const CATEGORY_TYPES = ["income", "expense"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  type: z.enum(CATEGORY_TYPES, { message: "Tipe kategori tidak valid" }),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().uuid("ID kategori tidak valid"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
