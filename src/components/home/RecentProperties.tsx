import { PropertyCard } from "@/components/property/PropertyCard";
import { Property } from "@/lib/api";

interface RecentPropertiesProps {
    properties: Property[];
}

export function RecentProperties({ properties }: RecentPropertiesProps) {
    if (!properties || properties.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Dernières <span className="text-blue-600">Nouveautés</span>
                    </h2>
                    <p className="text-gray-600">
                        Découvrez les propriétés les plus récentes ajoutées sur notre plateforme.
                        Ne manquez pas ces nouvelles opportunités.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property as any} />
                    ))}
                </div>
            </div>
        </section>
    );
}
