import { z } from "zod";

export const splitBillMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama teman wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Nominal tidak valid")
    .refine((value) => Number(value) > 0, "Nominal harus lebih dari 0"),
});

export const createSplitBillSchema = z
  .object({
    transactionId: z.string().uuid("ID transaksi tidak valid"),
    members: z
      .array(splitBillMemberSchema)
      .min(1, "Minimal satu anggota split bill")
      .max(50, "Maksimal 50 anggota"),
    createReceivables: z.boolean().default(false),
    notes: z.string().trim().max(500, "Catatan maksimal 500 karakter").optional(),
  })
  .superRefine((data, ctx) => {
    const total = data.members.reduce(
      (sum, m) => sum + Number(m.amount),
      0
    );
    if (total <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total pembagian harus lebih dari 0",
        path: ["members"],
      });
    }
  });

export type CreateSplitBillInput = z.infer<typeof createSplitBillSchema>;
