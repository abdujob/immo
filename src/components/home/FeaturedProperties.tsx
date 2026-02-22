"use client";

import { PropertyCard } from "@/components/property/PropertyCard";

interface FeaturedPropertiesProps {
    properties: any[];
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
    if (!properties || properties.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Propriétés en vedette
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Découvrez notre sélection de biens d&apos;exception au Sénégal
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            </div>
        </section>
    );
}
