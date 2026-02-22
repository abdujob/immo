import { z } from 'zod';

export const SearchSchema = z.object({
    transactionType: z.enum(['VENTE', 'LOCATION']).optional(),
    propertyType: z.enum(['APPARTEMENT', 'MAISON', 'VILLA', 'TERRAIN', 'BUREAU', 'COMMERCE', 'STUDIO', 'DUPLEX']).optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    minSurface: z.number().positive().optional(),
    maxSurface: z.number().positive().optional(),
    bedrooms: z.number().int().positive().optional(),
    hasParking: z.boolean().optional(),
    hasGarden: z.boolean().optional(),
    hasPool: z.boolean().optional(),
    limit: z.number().int().positive().max(100).default(20),
});

export type SearchDto = z.infer<typeof SearchSchema>;
