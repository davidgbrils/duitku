import { z } from "zod";

export const budgetSchema = z.object({
  categoryId: z.string().uuid({ message: "Pilih kategori pengeluaran yang valid." }),
  amountLimit: z
    .string()
    .trim()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Batas anggaran harus berupa angka positif lebih dari 0.",
    }),
  monthYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, { message: "Format bulan anggaran tidak valid (YYYY-MM)." }),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
