// API Service for ImmoSénégal Frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Property {
    id: string;
    title: string;
    description: string;
    type: string;
    transactionType: string;
    price: number;
    surface: number;
    rooms?: number;
    bedrooms?: number;
    bathrooms?: number;
    floor?: number;
    hasGarden: boolean;
    hasParking: boolean;
    hasPool: boolean;
    isFurnished: boolean;
    hasAirCon: boolean;
    hasGuardian: boolean;
    address: string;
    city: string;
    district?: string;
    lat?: number;
    lng?: number;
    images?: string;
    virtualTourUrl?: string;
    status: string;
    featured: boolean;
    verified: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
    owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    agency?: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
    _count?: {
        favorites?: number;
    };
}

export interface Agency {
    id: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    logo?: string;
    website?: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SearchFilters {
    city?: string;
    propertyType?: string;
    transactionType?: string;
    minPrice?: number;
    maxPrice?: number;
    minSurface?: number;
    maxSurface?: number;
    bedrooms?: number;
    hasParking?: boolean;
    hasGarden?: boolean;
    hasPool?: boolean;
}

const mockProperties: Property[] = [
    {
        id: "prop-1",
        title: "Villa de Luxe avec Vue sur l'Océan",
        description: "Magnifique villa moderne située sur la Corniche des Almadies. Profitez d'une piscine à débordement et d'un espace de vie exceptionnel.",
        type: "VILLA",
        transactionType: "VENTE",
        price: 450000000,
        surface: 600,
        rooms: 8,
        bedrooms: 5,
        bathrooms: 4,
        hasGarden: true,
        hasParking: true,
        hasPool: true,
        isFurnished: true,
        hasAirCon: true,
        hasGuardian: true,
        address: "Route des Almadies",
        city: "Dakar",
        district: "Almadies",
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1613490901591-8ac9fcdcc279?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80"
        ]),
        status: "ACTIVE",
        featured: true,
        verified: true,
        views: 1250,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: { id: "user-1", firstName: "Jean", lastName: "Dupont", email: "jean@example.com" },
        _count: { favorites: 42 }
    },
    {
        id: "prop-2",
        title: "Appartement Premium F4 Plateau",
        description: "Très bel appartement refait à neuf en plein cœur de Dakar Plateau, proche de toutes commodités et ambassades.",
        type: "APPARTEMENT",
        transactionType: "LOCATION",
        price: 1500000,
        surface: 180,
        rooms: 4,
        bedrooms: 3,
        bathrooms: 2,
        hasGarden: false,
        hasParking: true,
        hasPool: false,
        isFurnished: false,
        hasAirCon: true,
        hasGuardian: true,
        address: "Rue Félix Faure",
        city: "Dakar",
        district: "Plateau",
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1c9b2cb46a?auto=format&fit=crop&q=80"
        ]),
        status: "ACTIVE",
        featured: true,
        verified: true,
        views: 890,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: { id: "user-2", firstName: "Fatou", lastName: "Diop", email: "fatou@example.com" },
        _count: { favorites: 15 }
    },
    {
        id: "prop-3",
        title: "Maison Familiale avec Jardin à Ngor",
        description: "Idéale pour une famille, cette maison spacieuse offre un grand jardin fleuri et un cadre de vie calme.",
        type: "MAISON",
        transactionType: "VENTE",
        price: 210000000,
        surface: 350,
        rooms: 6,
        bedrooms: 4,
        bathrooms: 3,
        hasGarden: true,
        hasParking: true,
        hasPool: false,
        isFurnished: false,
        hasAirCon: true,
        hasGuardian: false,
        address: "Cité Ngor Almadies",
        city: "Dakar",
        district: "Ngor",
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80"
        ]),
        status: "ACTIVE",
        featured: false,
        verified: true,
        views: 450,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: { id: "user-3", firstName: "Moussa", lastName: "Sow", email: "msow@example.com" },
        _count: { favorites: 5 }
    }
];

/**
 * Get all properties
 */
export async function getProperties(): Promise<Property[]> {
    return Promise.resolve(mockProperties);
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: string): Promise<Property | null> {
    const prop = mockProperties.find(p => p.id === id);
    return Promise.resolve(prop || null);
}

/**
 * Search properties with filters
 */
export async function searchProperties(filters: SearchFilters): Promise<Property[]> {
    // Basic mock filtering
    let results = [...mockProperties];
    if (filters.city) results = results.filter(p => p.city.toLowerCase() === filters.city?.toLowerCase());
    if (filters.propertyType) results = results.filter(p => p.type === filters.propertyType);
    if (filters.transactionType) results = results.filter(p => p.transactionType === filters.transactionType);
    return Promise.resolve(results);
}

/**
 * Get all agencies
 */
export async function getAgencies(): Promise<Agency[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/agencies`);
        if (!response.ok) {
            throw new Error('Failed to fetch agencies');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching agencies:', error);
        return [];
    }
}

/**
 * Get featured properties
 */
export async function getFeaturedProperties(): Promise<Property[]> {
    return Promise.resolve(mockProperties.filter(p => p.featured));
}

/**
 * Parse images from JSON string
 */
export function parseImages(imagesJson?: string): string[] {
    if (!imagesJson) return ['/placeholder-property.svg'];
    try {
        const images = JSON.parse(imagesJson);
        if (Array.isArray(images) && images.length > 0) {
            return images.map((img: string) =>
                img.startsWith('/uploads') ? `${API_BASE_URL}${img}` : img
            );
        }
        return ['/placeholder-property.svg'];
    } catch {
        return ['/placeholder-property.svg'];
    }
}

/**
 * Format price in FCFA
 */
export function formatPrice(price: number): string {
    if (price >= 1000000) {
        return `${(price / 1000000).toFixed(0)}M FCFA`;
    }
    if (price >= 1000) {
        return `${(price / 1000).toFixed(0)}K FCFA`;
    }
    return `${price} FCFA`;
}

/**
 * Add a property to favorites
 */
export async function addFavorite(propertyId: string): Promise<boolean> {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('User not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ propertyId }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error adding favorite:', error);
        return false;
    }
}

/**
 * Remove a property from favorites
 */
export async function removeFavorite(propertyId: string): Promise<boolean> {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('User not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/favorites/${propertyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Error removing favorite:', error);
        return false;
    }
}

/**
 * Get user's favorite properties
 */
export async function getFavorites(): Promise<Property[]> {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return [];
        }

        const response = await fetch(`${API_BASE_URL}/favorites`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        // Backend returns favorites with property data
        if (Array.isArray(data)) {
            return data.map((fav: any) => fav.property);
        }
        return [];
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }
}

/**
 * Check if a property is in favorites
 */
export async function isFavorite(propertyId: string): Promise<boolean> {
    try {
        const favorites = await getFavorites();
        return favorites.some(fav => fav.id === propertyId);
    } catch (error) {
        console.error('Error checking favorite:', error);
        return false;
    }
}
