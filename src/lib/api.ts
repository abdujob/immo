// API Service for ImmoSénégal Frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
/**
 * Helper to get authentication headers
 */
function getAuthHeaders(headers: Record<string, string> = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        ...headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}


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
    images?: string | string[];
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
        avatar?: string;
    };
    agency?: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
    reviews?: any[];
    _count?: {
        favorites?: number;
    };
}

export interface PaginatedProperties {
    data: Property[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
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

export interface GlobalStats {
    propertiesCount: number;
    agenciesCount: number;
    usersCount: number;
}

// ─── PROPERTIES ────────────────────────────────────────────────────────────────

/**
 * Get all properties (paginated)
 */
export async function getProperties(page = 1, limit = 20): Promise<Property[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/properties?page=${page}&limit=${limit}`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Erreur serveur');
        const json: PaginatedProperties = await res.json();
        return json.data ?? [];
    } catch (error) {
        console.error('getProperties error:', error);
        return [];
    }
}

/**
 * Get paginated properties with meta (pour afficher le total, etc.)
 */
export async function getPaginatedProperties(
    page = 1,
    limit = 20,
    filters: Record<string, any> = {}
): Promise<PaginatedProperties> {
    try {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
            )
        });
        const res = await fetch(`${API_BASE_URL}/properties?${params}`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Erreur serveur');
        return await res.json();
    } catch (error) {
        console.error('getPaginatedProperties error:', error);
        return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: string): Promise<Property | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('getPropertyById error:', error);
        return null;
    }
}

/**
 * Get featured properties
 */
export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/properties/featured?limit=${limit}`, {
            next: { revalidate: 60 }, // cache 60s côté SSR
        });
        if (!res.ok) throw new Error('Erreur serveur');
        return await res.json();
    } catch (error) {
        console.error('getFeaturedProperties error:', error);
        return [];
    }
}

/**
 * Get recent properties
 */
export async function getRecentProperties(limit = 8): Promise<Property[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/properties/recent?limit=${limit}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) throw new Error('Erreur serveur');
        return await res.json();
    } catch (error) {
        console.error('getRecentProperties error:', error);
        return [];
    }
}

/**
 * Get similar properties for a given property ID
 */
export async function getSimilarProperties(propertyId: string, limit = 3): Promise<Property[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/similar?limit=${limit}`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Erreur serveur');
        return await res.json();
    } catch (error) {
        console.error('getSimilarProperties error:', error);
        return [];
    }
}

/**
 * Get my properties (authenticated)
 */
export async function getMyProperties(): Promise<Property[]> {
    try {
        const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (!user) return [];
        const res = await fetch(`${API_BASE_URL}/properties/my-properties`, {
            headers: getAuthHeaders(),
            credentials: 'include',
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('getMyProperties error:', error);
        return [];
    }
}

/**
 * Update property status
 */
export async function updatePropertyStatus(id: string, status: string): Promise<boolean> {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!user) return false;
    try {
        const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Toggle property featured status
 */
export async function updatePropertyFeatured(id: string, featured: boolean): Promise<boolean> {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!user) return false;
    try {
        const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            credentials: 'include',
            body: JSON.stringify({ featured })
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ─── SEARCH ────────────────────────────────────────────────────────────────────

/**
 * Search properties with filters (uses /search endpoint)
 */
export async function searchProperties(filters: SearchFilters): Promise<Property[]> {
    try {
        const params = new URLSearchParams();
        if (filters.city) params.set('city', filters.city);
        // Le backend attend "propertyType" mais le champ en BDD s'appelle "type"
        if (filters.propertyType) params.set('propertyType', filters.propertyType);
        if (filters.transactionType) params.set('transactionType', filters.transactionType);
        if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
        if (filters.minSurface !== undefined) params.set('minSurface', String(filters.minSurface));
        if (filters.maxSurface !== undefined) params.set('maxSurface', String(filters.maxSurface));
        if (filters.bedrooms !== undefined) params.set('bedrooms', String(filters.bedrooms));
        if (filters.hasParking) params.set('hasParking', 'true');
        if (filters.hasGarden) params.set('hasGarden', 'true');
        if (filters.hasPool) params.set('hasPool', 'true');

        const res = await fetch(`${API_BASE_URL}/search?${params}`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Erreur serveur');
        return await res.json();
    } catch (error) {
        console.error('searchProperties error:', error);
        return [];
    }
}

// ─── AGENCIES ──────────────────────────────────────────────────────────────────

/**
 * Get all agencies
 */
export async function getAgencies(): Promise<Agency[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/agencies`, {
            next: { revalidate: 300 }
        });
        if (!res.ok) throw new Error('Erreur serveur');
        return await res.json();
    } catch (error) {
        console.error('getAgencies error:', error);
        return [];
    }
}

/**
 * Get a single agency by ID
 */
export async function getAgencyById(id: string): Promise<any> {
    try {
        const res = await fetch(`${API_BASE_URL}/agencies/${id}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) throw new Error('Erreur serveur');
        return await res.json();
    } catch (error) {
        console.error('getAgencyById error:', error);
        return null;
    }
}

// ─── FAVORITES ─────────────────────────────────────────────────────────────────

/**
 * Add a property to favorites
 */
export async function addFavorite(propertyId: string): Promise<boolean> {
    try {
        const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (!user) throw new Error('User not authenticated');

        const res = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }), credentials: 'include',
            body: JSON.stringify({ propertyId })
        });
        return res.ok;
    } catch (error) {
        console.error('addFavorite error:', error);
        return false;
    }
}

/**
 * Remove a property from favorites
 */
export async function removeFavorite(propertyId: string): Promise<boolean> {
    try {
        const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (!user) throw new Error('User not authenticated');

        const res = await fetch(`${API_BASE_URL}/favorites/${propertyId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return res.ok;
    } catch (error) {
        console.error('removeFavorite error:', error);
        return false;
    }
}

/**
 * Get user's favorite properties
 */
export async function getFavorites(): Promise<Property[]> {
    try {
        const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (!user) return [];

        const res = await fetch(`${API_BASE_URL}/favorites`, {
            credentials: 'include',
            cache: 'no-store'
        });
        if (!res.ok) return [];

        const data = await res.json();
        if (Array.isArray(data)) {
            return data.map((fav: any) => fav.property ?? fav);
        }
        return [];
    } catch (error) {
        console.error('getFavorites error:', error);
        return [];
    }
}

/**
 * Check if a property is in favorites
 */
export async function isFavorite(propertyId: string): Promise<boolean> {
    try {
        const favorites = await getFavorites();
        return favorites.some((fav) => fav.id === propertyId);
    } catch (error) {
        console.error('isFavorite error:', error);
        return false;
    }
}

// ─── UTILITIES ─────────────────────────────────────────────────────────────────

/**
 * Parse images — accepts both string[] (backend) and JSON string (legacy)
 */
export function parseImages(images?: string | string[]): string[] {
    if (!images) return ['/placeholder-property.svg'];

    // Already an array (from backend)
    if (Array.isArray(images)) {
        if (images.length === 0) return ['/placeholder-property.svg'];
        return images.map((img) =>
            img.startsWith('/uploads') ? `${API_BASE_URL}${img}` : img
        );
    }

    // JSON string (legacy / stored format)
    try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((img: string) =>
                img.startsWith('/uploads') ? `${API_BASE_URL}${img}` : img
            );
        }
    } catch {
        // Not a JSON string — treat as direct URL
        if (images.startsWith('http') || images.startsWith('/')) {
            return [images.startsWith('/uploads') ? `${API_BASE_URL}${images}` : images];
        }
    }

    return ['/placeholder-property.svg'];
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
 * Build a full image URL from a relative path
 */
export function getImageUrl(path: string): string {
    if (!path) return '/placeholder-property.svg';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
}


// ==============================
// CONTACT / MESSAGING
// ==============================

/**
 * Send a contact message for a property
 */
export async function sendContact(propertyId: string, message: string, phone?: string, parentId?: string): Promise<boolean> {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!user) return false;
    try {
        const res = await fetch(`${API_BASE_URL}/contacts`, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            credentials: 'include',
            body: JSON.stringify({ propertyId, message, phone, parentId })
        });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Get unique conversation threads
 */
export async function getConversations(): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/contacts/conversations`, {
            headers: getAuthHeaders(),
            credentials: 'include',
            cache: 'no-store'
        });
        return res.ok ? res.json() : [];
    } catch {
        return [];
    }
}

/**
 * Get messages for a specific thread
 */
export async function getThreadMessages(otherUserId: string, propertyId: string): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/contacts/thread/${otherUserId}/${propertyId}`, {
            headers: getAuthHeaders(),
            credentials: 'include',
            cache: 'no-store'
        });
        return res.ok ? res.json() : [];
    } catch {
        return [];
    }
}

/**
 * Get contacts received (as property owner)
 */
export async function getContactsReceived(): Promise<any[]> {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!user) return [];
    try {
        const res = await fetch(`${API_BASE_URL}/contacts/received`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        return res.ok ? res.json() : [];
    } catch {
        return [];
    }
}

/**
 * Get contacts sent by the user
 */
export async function getContactsSent(): Promise<any[]> {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!user) return [];
    try {
        const res = await fetch(`${API_BASE_URL}/contacts/sent`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        return res.ok ? res.json() : [];
    } catch {
        return [];
    }
}
/**
 * Update contact status (PENDING | SEEN | REPLIED | CLOSED)
 */
export async function updateContactStatus(contactId: string, status: string): Promise<boolean> {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!user) return false;
    try {
        const res = await fetch(`${API_BASE_URL}/contacts/${contactId}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ─── REVIEWS ───────────────────────────────────────────────────────────────────

/**
 * Submit a review for a property or agency
 */
export async function submitReview(data: {
    targetType: 'PROPERTY' | 'AGENCY';
    propertyId?: string;
    agencyId?: string;
    rating: number;
    comment: string;
}): Promise<boolean> {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!user) return false;
    try {
        const res = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Get global stats for the homepage
 */
export async function getStats(): Promise<GlobalStats> {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { propertiesCount: 0, agenciesCount: 0, usersCount: 0 };
    }
}
// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────

/**
 * Get user notifications
 */
export async function getNotifications(): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/notifications`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        return res.ok ? res.json() : [];
    } catch {
        return [];
    }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ─── AUTHENTICATION (NEW) ──────────────────────────────────────────────────────

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/verify?token=${token}`);
        const data = await res.json();
        return { success: res.ok, message: data.message };
    } catch {
        return { success: false, message: 'Erreur de connexion' };
    }
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        return { success: res.ok, message: data.message };
    } catch {
        return { success: false, message: 'Erreur de connexion' };
    }
}

/**
 * Reset password with token
 */
export async function resetPassword(dto: { token: string; password: string }): Promise<{ success: boolean; message: string }> {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });
        const data = await res.json();
        return { success: res.ok, message: data.message };
    } catch {
        return { success: false, message: 'Erreur de connexion' };
    }
}
