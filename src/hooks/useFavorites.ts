"use client";

import { useState, useEffect } from "react";
import { addFavorite, removeFavorite, getFavorites } from "@/lib/api";

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Load favorites on mount
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const favs = await getFavorites();
            setFavorites(favs.map(f => f.id));
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (propertyId: string) => {
        const isFav = favorites.includes(propertyId);

        if (isFav) {
            // Remove from favorites
            const success = await removeFavorite(propertyId);
            if (success) {
                setFavorites(prev => prev.filter(id => id !== propertyId));
            }
            return !success; // Return new state
        } else {
            // Add to favorites
            const success = await addFavorite(propertyId);
            if (success) {
                setFavorites(prev => [...prev, propertyId]);
            }
            return success; // Return new state
        }
    };

    const isFavorite = (propertyId: string) => {
        return favorites.includes(propertyId);
    };

    return {
        favorites,
        loading,
        toggleFavorite,
        isFavorite,
        refreshFavorites: loadFavorites,
    };
}
