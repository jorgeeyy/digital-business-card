import { z } from 'zod';

export const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

const USERNAME_MSG =
  'Use 3–30 chars: lowercase letters, numbers, - or _ (start with a letter or number)';

export const usernameSchema = z.string().regex(USERNAME_RE, USERNAME_MSG);

export const phoneSchema = z
  .string()
  .regex(/^[+()\-.\s\d]{3,20}$/, 'Phone can only contain digits and the characters + - ( ) .');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailSchema = z
  .string()
  .regex(EMAIL_RE, 'Enter a valid email (e.g. name@example.com)');

export const websiteSchema = z
  .string()
  .refine(
    (value) => {
      try {
        const url = new URL(value.startsWith('http') ? value : `https://${value}`);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    'Enter a valid website (e.g. example.com)',
  );

export function validateField(schema: z.ZodType, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const result = schema.safeParse(trimmed);
  return result.success ? null : (result.error.issues[0]?.message ?? 'Invalid value');
}
