import { z } from 'zod';

export const CreateReviewSchema = z.object({
    rating: z.number().int().min(1).max(5, 'La note doit être entre 1 et 5'),
    comment: z.string().optional(),
    targetType: z.enum(['PROPERTY', 'AGENCY']),
    propertyId: z.string().uuid().optional(),
    agencyId: z.string().uuid().optional(),
}).refine(
    (data) => {
        if (data.targetType === 'PROPERTY' && !data.propertyId) {
            return false;
        }
        if (data.targetType === 'AGENCY' && !data.agencyId) {
            return false;
        }
        return true;
    },
    {
        message: 'propertyId est requis pour les avis sur les propriétés, agencyId pour les agences',
    }
);

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;
