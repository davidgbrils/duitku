import { z } from "zod";

export const TRANSACTION_TYPES = ["income", "expense"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/** Nominal dalam bentuk string input form: angka positif (boleh 1-2 desimal). */
const amountString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Nominal tidak valid")
  .refine((value) => Number(value) > 0, "Nominal harus lebih dari 0");

/**
 * Sentinel untuk opsi "Tanpa Kategori" pada Select.
 * Base UI Select tidak menerima value kosong (""), jadi pakai
 * nilai khusus ini yang diubah menjadi null di server action.
 */
export const NO_CATEGORY_VALUE = "__none";

const categoryIdSchema = z
  .string()
  .refine(
    (value) =>
      value === NO_CATEGORY_VALUE || z.string().uuid().safeParse(value).success,
    "Kategori tidak valid"
  );

const descriptionSchema = z
  .string()
  .trim()
  .max(500, "Deskripsi maksimal 500 karakter")
  .optional()
  .or(z.literal(""));

const transactionDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid");

export const createTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES, { message: "Tipe transaksi tidak valid" }),
  walletId: z.string().uuid("Wallet tidak valid"),
  categoryId: categoryIdSchema,
  amount: amountString,
  description: descriptionSchema,
  transactionDate: transactionDateSchema,
  receiptImageUrl: z
    .string()
    .trim()
    .max(1000, "URL struk terlalu panjang")
    .optional()
    .or(z.literal("")),
});

export const updateTransactionSchema = z.object({
  id: z.string().uuid("ID transaksi tidak valid"),
  type: z.enum(TRANSACTION_TYPES, { message: "Tipe transaksi tidak valid" }),
  walletId: z.string().uuid("Wallet tidak valid"),
  categoryId: categoryIdSchema,
  amount: amountString,
  description: descriptionSchema,
  transactionDate: transactionDateSchema,
  receiptImageUrl: z
    .string()
    .trim()
    .max(1000, "URL struk terlalu panjang")
    .optional()
    .or(z.literal("")),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
