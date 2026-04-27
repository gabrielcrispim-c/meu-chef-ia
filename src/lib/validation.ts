// ✅ VALIDAÇÃO DE SCHEMA - Segurança de entrada
// Instalar: npm install zod

import { z } from 'zod';

/**
 * Schema para validação de login/signup
 */
export const AuthSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .min(5, 'Email muito curto')
    .max(254, 'Email muito longo'),

  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter letra MAIÚSCULA')
    .regex(/[a-z]/, 'Deve conter letra minúscula')
    .regex(/[0-9]/, 'Deve conter número')
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      'Deve conter caractere especial (!@#$%^&* etc)'
    ),
});

export type AuthInput = z.infer<typeof AuthSchema>;

/**
 * Schema para validação de OTP (6 dígitos)
 */
export const OtpSchema = z.object({
  code: z
    .string()
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d+$/, 'Código deve conter apenas números'),
});

export type OtpInput = z.infer<typeof OtpSchema>;

/**
 * Função para validar auth
 */
export function validateAuth(data: unknown) {
  try {
    const validated = AuthSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Erro na validação' };
    }
    return { success: false, error: 'Erro na validação' };
  }
}

/**
 * Função para validar OTP
 */
export function validateOtp(data: unknown) {
  try {
    const validated = OtpSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Código inválido' };
    }
    return { success: false, error: 'Código inválido' };
  }
}

/**
 * Retorna força da senha (0-100)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    strength += 15;

  return Math.min(strength, 100);
}

/**
 * Retorna descrição de força da senha
 */
export function getPasswordStrengthLabel(strength: number): string {
  if (strength < 40) return 'Fraca';
  if (strength < 60) return 'Média';
  if (strength < 80) return 'Boa';
  return 'Muito Forte';
}
