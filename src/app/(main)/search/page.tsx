"use client";

import { HairdresserCard } from "@/components/search/HairdresserCard";
import { MapView } from "@/components/search/MapView";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                // Build query string
                const params = new URLSearchParams();
                const q = searchParams.get('q');
                const type = searchParams.get('type');
                if (q) params.append('q', q);
                if (type) params.append('type', type);

                const res = await fetch(`http://localhost:4000/coiffeurs/search?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
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
            {/* List Section */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto p-4 lg:p-6 scrollbar-thin">
                <h1 className="text-2xl font-bold mb-6">Coiffeurs à proximité</h1>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {results.length === 0 ? (
                            <p className="text-muted-foreground text-center py-10">Aucun coiffeur trouvé.</p>
                        ) : results.map((pro) => (
                            <HairdresserCard
                                key={pro.id}
                                hairdresser={{
                                    id: pro.id,
                                    name: pro.firstName ? `${pro.firstName} ${pro.lastName}` : "Coiffeur sans nom",
                                    neighborhood: pro.city || "Ville inconnue",
                                    rating: 0, // No rating logic yet
                                    reviewCount: 0,
                                    startingPrice: 0, // No services logic yet
                                    images: [
                                        "https://placehold.co/600x400/png?text=Salon+Photo",
                                        "https://placehold.co/600x400/png?text=Coupe+H",
                                        "https://placehold.co/600x400/png?text=Coupe+F"
                                    ],
                                    isSalon: pro.type === 'SALON',
                                    isHome: pro.type === 'DOMICILE',
                                    isAvailableToday: true // Mock availability
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Map Section - Hidden on mobile, Flex on Desktop */}
            <div className="hidden lg:block lg:w-1/2 h-full bg-gray-100">
                <MapView />
            </div>
        </div>
    );
}
