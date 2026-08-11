import { z } from "zod";

/** Nominal dalam bentuk string input form: angka positif (boleh 1-2 desimal). */
const amountString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Nominal tidak valid")
  .refine((value) => Number(value) > 0, "Nominal harus lebih dari 0");

const walletIdSchema = z.string().uuid("Wallet tidak valid");

const descriptionSchema = z
  .string()
  .trim()
  .max(500, "Deskripsi maksimal 500 karakter")
  .optional()
  .or(z.literal(""));

const transferDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid");

export const createTransferSchema = z
  .object({
    sourceWalletId: walletIdSchema,
    destinationWalletId: walletIdSchema,
    amount: amountString,
    description: descriptionSchema,
    transferDate: transferDateSchema,
  })
  .refine(
    (data) => data.sourceWalletId !== data.destinationWalletId,
    "Wallet asal dan tujuan harus berbeda"
  );

export const updateTransferSchema = z
  .object({
    id: z.string().uuid("ID transfer tidak valid"),
    sourceWalletId: walletIdSchema,
    destinationWalletId: walletIdSchema,
    amount: amountString,
    description: descriptionSchema,
    transferDate: transferDateSchema,
  })
  .refine(
    (data) => data.sourceWalletId !== data.destinationWalletId,
    "Wallet asal dan tujuan harus berbeda"
  );

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type UpdateTransferInput = z.infer<typeof updateTransferSchema>;
