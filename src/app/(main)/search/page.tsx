"use client";

import { PropertyCard } from "@/components/property/PropertyCard";
import { MapView } from "@/components/search/MapView";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { searchProperties, Property } from "@/lib/api";

function SearchContent() {
    const searchParams = useSearchParams();
    const [results, setResults] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const q = searchParams.get("q") || undefined;
                const type = searchParams.get("type") || undefined;

                const data = await searchProperties({
                    city: q,
                    propertyType: type
                });

                setResults(data);
            } catch (error) {
                console.error("Failed to fetch", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [searchParams]);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <div className="w-full lg:w-1/2 h-full overflow-y-auto p-4 lg:p-6 scrollbar-thin">
                <h1 className="text-2xl font-bold mb-6">Biens immobiliers à proximité</h1>
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {results.length === 0 ? (
                            <p className="text-muted-foreground text-center py-10">Aucun bien immobilier trouvé.</p>
                        ) : (
                            results.map((pro) => (
                                <PropertyCard
                                    key={pro.id}
                                    property={pro as any}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
            <div className="hidden lg:block lg:w-1/2 h-full bg-gray-100">
                <MapView />
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <SearchContent />
        </Suspense>
    );
}
