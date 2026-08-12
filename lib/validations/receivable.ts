import { z } from "zod";

export const receivableSchema = z.object({
  borrowerName: z
    .string()
    .trim()
    .min(2, { message: "Nama peminjam minimal 2 karakter." })
    .max(100, { message: "Nama peminjam maksimal 100 karakter." }),
  amount: z
    .string()
    .trim()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Nominal piutang harus berupa angka positif lebih dari 0.",
    }),
  dueDate: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: "Format tanggal janji bayar tidak valid (YYYY-MM-DD)." }
    ),
  notes: z.string().trim().max(500, { message: "Catatan maksimal 500 karakter." }).optional(),
});

export const receivablePaymentSchema = z.object({
  receivableId: z.string().uuid({ message: "ID piutang tidak valid." }),
  walletId: z.string().uuid({ message: "Pilih dompet/rekening penerima." }),
  amount: z
    .string()
    .trim()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Nominal penerimaan harus berupa angka positif lebih dari 0.",
    }),
  paymentDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Tanggal penerimaan tidak valid." }),
  notes: z.string().trim().max(500).optional(),
});

export type ReceivableInput = z.infer<typeof receivableSchema>;
export type ReceivablePaymentInput = z.infer<typeof receivablePaymentSchema>;
