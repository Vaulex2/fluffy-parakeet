import { z } from "zod";

export const signUpSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  // L9: bound phone length/format, consistent with the reservation schema
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Phone number must be 7–15 digits")
    .optional()
    .or(z.literal("")),
  preferred_language: z.enum(["en", "uz", "ru"]).optional(),
  // L-04: Restrict avatar URLs to known-safe domains (own Supabase bucket + Google OAuth avatars)
  avatar_url: z
    .string()
    .url()
    .refine(
      (url) => {
        const ALLOWED_HOSTS = [
          'vczkclhdepdvnbmggeax.supabase.co',
          'lh3.googleusercontent.com',
        ];
        try {
          return ALLOWED_HOSTS.some((h) => new URL(url).hostname === h);
        } catch {
          return false;
        }
      },
      { message: 'Avatar URL must be from an allowed domain.' }
    )
    .optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
