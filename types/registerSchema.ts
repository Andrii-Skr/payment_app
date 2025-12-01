import { z } from "zod";

export const registerSchema = z.object({
  login: z.string().min(3, "Логин должен содержать минимум 3 символа").max(32, "Логин не должен превышать 32 символа"),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .max(64, "Пароль не должен превышать 64 символа"),
  name: z.string().min(2, "Имя должно быть не короче 2 символов").max(64, "Имя не должно превышать 64 символа"),
});

export type RegisterBody = z.infer<typeof registerSchema>;
