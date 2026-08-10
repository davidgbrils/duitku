import { z } from "zod";

const emailSchema = z.email("Format email tidak valid").trim();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Nama wajib diisi")
      .max(100, "Nama maksimal 100 karakter"),
    email: emailSchema,
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
