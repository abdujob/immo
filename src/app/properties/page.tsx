"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { searchProperties, getProperties, type Property, type SearchFilters } from "@/lib/api";
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

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                // If filters are applied, use search, otherwise get all properties
                const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '' && v !== 'all');
                const data = hasFilters ? await searchProperties(filters) : await getProperties();
                setProperties(data);
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [filters]);

    const handleFilterChange = (newFilters: any) => {
        // Convert "all" values to undefined for the API
        const cleanedFilters: SearchFilters = {};
        if (newFilters.city && newFilters.city !== 'all') cleanedFilters.city = newFilters.city;
        if (newFilters.propertyType && newFilters.propertyType !== 'all') cleanedFilters.propertyType = newFilters.propertyType;
        if (newFilters.transactionType) cleanedFilters.transactionType = newFilters.transactionType;
        if (newFilters.minPrice) cleanedFilters.minPrice = newFilters.minPrice;
        if (newFilters.maxPrice && newFilters.maxPrice < 1000000000) cleanedFilters.maxPrice = newFilters.maxPrice;
        if (newFilters.minSurface) cleanedFilters.minSurface = newFilters.minSurface;
        if (newFilters.maxSurface && newFilters.maxSurface < 1000) cleanedFilters.maxSurface = newFilters.maxSurface;
        if (newFilters.bedrooms) cleanedFilters.bedrooms = newFilters.bedrooms;
        if (newFilters.hasParking) cleanedFilters.hasParking = true;
        if (newFilters.hasGarden) cleanedFilters.hasGarden = true;
        if (newFilters.hasPool) cleanedFilters.hasPool = true;

        setFilters(cleanedFilters);
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
                            {properties.length} propriétés disponibles
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
                            <div className="text-center py-12">
                                <p className="text-gray-500">Chargement...</p>
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Aucune propriété trouvée</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {properties.map((property) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
