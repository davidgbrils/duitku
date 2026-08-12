import { z } from "zod";

export const debtSchema = z.object({
  lenderName: z
    .string()
    .trim()
    .min(2, { message: "Nama pemberi pinjaman minimal 2 karakter." })
    .max(100, { message: "Nama pemberi pinjaman maksimal 100 karakter." }),
  amount: z
    .string()
    .trim()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Nominal hutang harus berupa angka positif lebih dari 0.",
    }),
  dueDate: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: "Format tanggal jatuh tempo tidak valid (YYYY-MM-DD)." }
    ),
  notes: z.string().trim().max(500, { message: "Catatan maksimal 500 karakter." }).optional(),
});

export const debtPaymentSchema = z.object({
  debtId: z.string().uuid({ message: "ID hutang tidak valid." }),
  walletId: z.string().uuid({ message: "Pilih dompet/rekening pembayaran." }),
  amount: z
    .string()
    .trim()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Nominal pembayaran harus berupa angka positif lebih dari 0.",
    }),
  paymentDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Tanggal pembayaran tidak valid." }),
  notes: z.string().trim().max(500).optional(),
});

export type DebtInput = z.infer<typeof debtSchema>;
export type DebtPaymentInput = z.infer<typeof debtPaymentSchema>;
