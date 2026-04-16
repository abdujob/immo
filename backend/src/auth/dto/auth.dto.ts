import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const passwordSchema = z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères");
const phoneSchema = z.string().min(8, "Le numéro de téléphone est requis");

export const RegisterSchema = z.object({
    email: z.string().email('Email invalide'),
    password: passwordSchema,
    firstName: z.preprocess((val) => val === '' ? undefined : val, z.string().min(2, 'Le prénom est requis').optional()),
    lastName: z.preprocess((val) => val === '' ? undefined : val, z.string().min(2, 'Le nom est requis').optional()),
    phone: phoneSchema.optional(),
    role: z.enum(['INDIVIDUAL', 'AGENCY_AGENT', 'ADMIN']).default('INDIVIDUAL'),
    agencyId: z.string().uuid().optional(), // For agency agents
});

export class RegisterDto extends createZodDto(RegisterSchema) { }

export const LoginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string(),
});

export class LoginDto extends createZodDto(LoginSchema) { }

export const ForgotPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) { }

export const ResetPasswordSchema = z.object({
    token: z.string(),
    password: passwordSchema,
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) { }
