"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Property, getFavorites } from "@/lib/api";

export default function DashboardFavoritesPage() {
    const { isAuthenticated, user } = useAuth();
    const [favorites, setFavorites] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        } else if (!isAuthenticated && !loading) {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchFavorites = async () => {
        try {
            const data = await getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) return null; // Protégé par DashboardProtection

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
                    <p className="text-gray-500">Retrouvez toutes les annonces que vous avez sauvegardées.</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Heart className="h-6 w-6 text-red-600 fill-red-600" />
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed">
                    <Heart className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun favori</h3>
                    <p className="text-gray-500">Vous n'avez pas encore ajouté de propriétés à vos favoris.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {favorites.map((property: any) => (
                        <div key={property.id} className="relative">
                            <PropertyCard property={property as Property} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
