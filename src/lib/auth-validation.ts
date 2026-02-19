import { z } from 'zod'

/** Password complexity: min 8 chars, at least one letter and one number */
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/

export const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(passwordRegex, 'Include at least one letter and one number')

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: passwordSchema,
  displayName: z.string().min(1, 'Name required').optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})

export const magicLinkSchema = z.object({
  email: z.string().email('Invalid email'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type MagicLinkFormData = z.infer<typeof magicLinkSchema>
