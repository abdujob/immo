import { z } from 'zod';

export const CreateContactSchema = z.object({
    propertyId: z.string().uuid('ID de propriété invalide'),
    message: z.string().min(1, 'Le message ne peut pas être vide'),
    phone: z.string().optional(),
    email: z.string().email('Email invalide').optional(),
    parentId: z.string().uuid().optional(),
});

export type CreateContactDto = z.infer<typeof CreateContactSchema>;

export const ContactStatus = z.enum(['PENDING', 'CONTACTED', 'CLOSED']);
