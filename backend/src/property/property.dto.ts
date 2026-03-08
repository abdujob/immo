import { z } from 'zod';

// Property Types
export const PropertyType = z.enum([
    'APPARTEMENT',
    'MAISON',
    'VILLA',
    'TERRAIN',
    'BUREAU',
    'COMMERCE',
    'STUDIO',
    'DUPLEX',
]);

export const TransactionType = z.enum(['VENTE', 'LOCATION']);

export const PropertyStatus = z.enum([
    'ACTIVE',
    'PENDING',
    'SOLD',
    'RENTED',
    'INACTIVE',
]);

// Create Property DTO
export const CreatePropertySchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    type: PropertyType,
    transactionType: TransactionType,
    price: z.number().positive('Le prix doit être positif'),
    surface: z.number().positive('La surface doit être positive'),
    rooms: z.number().int().positive().optional(),
    bedrooms: z.number().int().positive().optional(),
    bathrooms: z.number().int().positive().optional(),
    floor: z.number().int().optional(),
    hasGarden: z.boolean().default(false),
    hasParking: z.boolean().default(false),
    hasPool: z.boolean().default(false),
    isFurnished: z.boolean().default(false),
    hasAirCon: z.boolean().default(false),
    hasGuardian: z.boolean().default(false),
    address: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    virtualTourUrl: z.string().url().optional().or(z.literal('')),
    agencyId: z.string().uuid().optional(),
});

export type CreatePropertyDto = z.infer<typeof CreatePropertySchema>;

// Update Property DTO
export const UpdatePropertySchema = CreatePropertySchema.partial();
export type UpdatePropertyDto = z.infer<typeof UpdatePropertySchema>;

// Query/Filter DTO
export const PropertyFilterSchema = z.object({
    city: z.string().optional(),
    district: z.string().optional(),
    type: PropertyType.optional(),
    transactionType: TransactionType.optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    minSurface: z.coerce.number().positive().optional(),
    maxSurface: z.coerce.number().positive().optional(),
    bedrooms: z.coerce.number().int().positive().optional(),
    bathrooms: z.coerce.number().int().positive().optional(),
    hasGarden: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    hasParking: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    hasPool: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    isFurnished: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    featured: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    status: PropertyStatus.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z
        .enum(['price', 'createdAt', 'surface', 'views'])
        .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PropertyFilterDto = z.infer<typeof PropertyFilterSchema>;
