import { z } from 'zod';

export const CreateContactSchema = z.object({
    propertyId: z.string().uuid('ID de propriété invalide'),
    message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
    phone: z.string().optional(),
    email: z.string().email('Email invalide').optional(),
    parentId: z.string().uuid().optional(),
});

export type CreateContactDto = z.infer<typeof CreateContactSchema>;

export const ContactStatus = z.enum(['PENDING', 'CONTACTED', 'CLOSED']);
