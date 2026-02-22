import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateUserSchema = z.object({
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
    phone: z.string().optional().or(z.literal('')),
    email: z.string().email('Email invalide').optional(),
    // Password change should probably be a separate endpoint for security, but can be here if needed
    // currentPassword & newPassword logic usually requires specific handling
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) { }
