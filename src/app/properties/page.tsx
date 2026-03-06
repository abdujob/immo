"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { getPaginatedProperties, searchProperties, type Property, type SearchFilters } from "@/lib/api";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 12;

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const hasFilters = Object.values(filters).some(
                    (v) => v !== undefined && v !== '' && v !== false
                );

                if (hasFilters) {
                    // Recherche via /search
                    const data = await searchProperties(filters);
                    setProperties(data);
                    setTotal(data.length);
                    setTotalPages(1);
                } else {
                    // Listing paginé via /properties
                    const result = await getPaginatedProperties(page, LIMIT);
                    setProperties(result.data);
                    setTotal(result.meta.total);
                    setTotalPages(result.meta.totalPages);
                }
            } catch (error) {
                console.error('Erreur chargement propriétés:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [filters, page]);

    const handleFilterChange = (newFilters: any) => {
        const cleaned: SearchFilters = {};
        if (newFilters.city && newFilters.city !== 'all') cleaned.city = newFilters.city;
        if (newFilters.propertyType && newFilters.propertyType !== 'all') cleaned.propertyType = newFilters.propertyType;
        if (newFilters.transactionType) cleaned.transactionType = newFilters.transactionType;
        if (newFilters.minPrice) cleaned.minPrice = newFilters.minPrice;
        if (newFilters.maxPrice && newFilters.maxPrice < 1000000000) cleaned.maxPrice = newFilters.maxPrice;
        if (newFilters.minSurface) cleaned.minSurface = newFilters.minSurface;
        if (newFilters.maxSurface && newFilters.maxSurface < 1000) cleaned.maxSurface = newFilters.maxSurface;
        if (newFilters.bedrooms) cleaned.bedrooms = newFilters.bedrooms;
        if (newFilters.hasParking) cleaned.hasParking = true;
        if (newFilters.hasGarden) cleaned.hasGarden = true;
        if (newFilters.hasPool) cleaned.hasPool = true;

        setPage(1); // Retour en page 1 à chaque nouveau filtre
        setFilters(cleaned);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Toutes les annonces
                        </h1>
                        <p className="text-gray-600">
                            {loading ? (
                                <span className="inline-flex items-center gap-1 text-gray-400">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                                </span>
                            ) : (
                                `${total} propriété${total > 1 ? 's' : ''} disponible${total > 1 ? 's' : ''}`
                            )}
                        </p>
                    </div>

                    {/* Mobile Filter Button */}
                    <div className="lg:hidden">
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline">
                                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                                    Filtres
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] overflow-y-auto">
                                <PropertyFilters
                                    onFilterChange={handleFilterChange}
                                    onClose={() => setIsFilterOpen(false)}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Filters Sidebar */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
                            <PropertyFilters onFilterChange={handleFilterChange} />
                        </div>
                    </aside>

                    {/* Properties Grid */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center py-24">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">Aucune propriété trouvée</p>
                                <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {properties.map((property) => (
                                        <PropertyCard key={property.id} property={property as any} />
                                    ))}
                                </div>

                                {/* Pagination — uniquement si pas de filtre de recherche */}
                                {totalPages > 1 && Object.keys(filters).length === 0 && (
                                    <div className="flex justify-center items-center gap-2 mt-10">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            ← Précédent
                                        </Button>
                                        <span className="text-sm text-gray-600 px-4">
                                            Page {page} / {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                        >
                                            Suivant →
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
