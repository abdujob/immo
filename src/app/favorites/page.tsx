"use client";

import { useEffect, useState } from "react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Property } from "@/lib/api";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
    const { favorites, loading, toggleFavorite, isFavorite, refreshFavorites } = useFavorites();
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        loadFavoriteProperties();
    }, [favorites]);

    const loadFavoriteProperties = async () => {
        try {
            const { getFavorites } = await import("@/lib/api");
            const favProps = await getFavorites();
            setProperties(favProps);
        } catch (error) {
            console.error('Error loading favorite properties:', error);
        }
    };

    const handleFavoriteToggle = async (propertyId: string) => {
        await toggleFavorite(propertyId);
        await refreshFavorites();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chargement...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                        <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
                    </div>
                    <p className="text-gray-600">
                        {properties.length} {properties.length > 1 ? 'propriétés sauvegardées' : 'propriété sauvegardée'}
                    </p>
                </div>

                {/* Properties Grid */}
                {properties.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            Aucun favori pour le moment
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Commencez à ajouter des propriétés à vos favoris pour les retrouver facilement ici.
                        </p>
                        <a
                            href="/properties"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Parcourir les annonces
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                onFavoriteToggle={handleFavoriteToggle}
                                isFavorite={isFavorite(property.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
