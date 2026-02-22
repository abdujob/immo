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
    title: z.string().min(10, 'Le titre doit contenir au moins 10 caractères'),
    description: z
        .string()
        .min(50, 'La description doit contenir au moins 50 caractères'),
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
    address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
    city: z.string().min(2, 'La ville est requise'),
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
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    minSurface: z.number().positive().optional(),
    maxSurface: z.number().positive().optional(),
    bedrooms: z.number().int().positive().optional(),
    bathrooms: z.number().int().positive().optional(),
    hasGarden: z.boolean().optional(),
    hasParking: z.boolean().optional(),
    hasPool: z.boolean().optional(),
    isFurnished: z.boolean().optional(),
    featured: z.boolean().optional(),
    status: PropertyStatus.optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
    sortBy: z
        .enum(['price', 'createdAt', 'surface', 'views'])
        .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PropertyFilterDto = z.infer<typeof PropertyFilterSchema>;
