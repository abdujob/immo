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

/**
 * Get all properties
 */
export async function getProperties(): Promise<Property[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/properties`);
        if (!response.ok) {
            throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        // Handle different response formats
        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray(data.properties)) {
            return data.properties;
        }
        if (data && Array.isArray(data.data)) {
            return data.data;
        }
        console.warn('Unexpected response format:', data);
        return [];
    } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
    }
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: string): Promise<Property | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching property ${id}:`, error);
        return null;
    }
}

/**
 * Search properties with filters
 */
export async function searchProperties(filters: SearchFilters): Promise<Property[]> {
    try {
        const params = new URLSearchParams();

        if (filters.city) params.append('city', filters.city);
        if (filters.propertyType) params.append('type', filters.propertyType);
        if (filters.transactionType) params.append('transactionType', filters.transactionType);
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.minSurface) params.append('minSurface', filters.minSurface.toString());
        if (filters.maxSurface) params.append('maxSurface', filters.maxSurface.toString());
        if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString());
        if (filters.hasParking) params.append('hasParking', 'true');
        if (filters.hasGarden) params.append('hasGarden', 'true');
        if (filters.hasPool) params.append('hasPool', 'true');

        const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to search properties');
        }
        const data = await response.json();
        // Handle different response formats
        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray(data.properties)) {
            return data.properties;
        }
        if (data && Array.isArray(data.data)) {
            return data.data;
        }
        console.warn('Unexpected search response format:', data);
        return [];
    } catch (error) {
        console.error('Error searching properties:', error);
        return [];
    }
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
    try {
        const response = await fetch(`${API_BASE_URL}/properties?featured=true`);
        if (!response.ok) {
            throw new Error('Failed to fetch featured properties');
        }
        const data = await response.json();
        // Handle different response formats
        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray(data.properties)) {
            return data.properties;
        }
        if (data && Array.isArray(data.data)) {
            return data.data;
        }
        console.warn('Unexpected featured properties response format:', data);
        return [];
    } catch (error) {
        console.error('Error fetching featured properties:', error);
        return [];
    }
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
