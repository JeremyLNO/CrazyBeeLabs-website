import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().max(80).optional().or(z.literal("")),
  lastName: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
  // ISO date (yyyy-mm-dd) from <input type="date">; optional.
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
    .optional()
    .or(z.literal("")),
});

export const profileSchema = z.object({
  name: z.string().trim().max(80).optional().or(z.literal("")),
  lastName: z.string().trim().max(80).optional().or(z.literal("")),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const checkEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const appleAuthSchema = z.object({
  identityToken: z.string().min(1),
  // Apple only sends these on the FIRST authorization; the client caches and resends them.
  name: z.string().trim().max(160).optional(),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
  name: z.string().trim().max(160).optional(),
});

export const mobileRegisterSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
