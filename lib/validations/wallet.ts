import { z } from "zod";

export const WALLET_TYPES = ["cash", "bank", "ewallet", "other"] as const;
export type WalletType = (typeof WALLET_TYPES)[number];

/** Nominal awal wallet: angka non-negatif (boleh 1-2 desimal). */
const nonNegativeAmountString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Nominal tidak valid");

export const createWalletSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wallet wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  type: z.enum(WALLET_TYPES, { message: "Tipe wallet tidak valid" }),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, "Kode currency 3 huruf (mis. IDR)")
    .toUpperCase(),
  initialBalance: nonNegativeAmountString,
});

export const updateWalletSchema = z.object({
  id: z.string().uuid("ID wallet tidak valid"),
  name: z
    .string()
    .trim()
    .min(1, "Nama wallet wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  type: z.enum(WALLET_TYPES, { message: "Tipe wallet tidak valid" }),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, "Kode currency 3 huruf (mis. IDR)")
    .toUpperCase(),
  isActive: z.boolean(),
});

export const adjustWalletBalanceSchema = z.object({
  id: z.string().uuid("ID wallet tidak valid"),
  newBalance: z
    .string()
    .trim()
    .regex(/^-?\d+(\.\d{1,2})?$/, "Nominal tidak valid (boleh negatif)")
    .refine((val) => {
      const num = Number(val);
      return Number.isFinite(num);
    }, "Nominal harus berupa angka yang valid"),
  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter").optional(),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
export type AdjustWalletBalanceInput = z.infer<typeof adjustWalletBalanceSchema>;
