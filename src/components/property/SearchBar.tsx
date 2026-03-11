"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PROPERTY_TYPES = [
    { value: "APPARTEMENT", label: "Appartement" },
    { value: "MAISON", label: "Maison" },
    { value: "VILLA", label: "Villa" },
    { value: "TERRAIN", label: "Terrain" },
    { value: "BUREAU", label: "Bureau" },
    { value: "COMMERCE", label: "Commerce" },
    { value: "STUDIO", label: "Studio" },
    { value: "DUPLEX", label: "Duplex" },
];

interface SearchBarProps {
    onSearch?: (filters: {
        city?: string;
        propertyType?: string;
        transactionType?: string;
        minPrice?: number;
        maxPrice?: number;
    }) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const router = useRouter();
    const [city, setCity] = useState("");
    const [propertyType, setPropertyType] = useState("all");
    const [transactionType, setTransactionType] = useState("VENTE");

    const handleSearch = () => {
        const filters = {
            city: city.trim() || undefined,
            propertyType: propertyType !== "all" ? propertyType : undefined,
            transactionType: transactionType || undefined,
        };

        if (onSearch) {
            onSearch(filters);
        } else {
            // Logic de redirection par défaut vers /properties avec les filtres
            const params = new URLSearchParams();
            if (filters.city) params.set('city', filters.city);
            if (filters.propertyType) params.set('propertyType', filters.propertyType);
            if (filters.transactionType) params.set('transactionType', filters.transactionType);
            
            router.push(`/properties?${params.toString()}`);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                {/* Transaction Type Toggle */}
                <div className="flex gap-2 mb-4">
                    <Button
                        variant={transactionType === "VENTE" ? "black" : "outline"}
                        onClick={() => setTransactionType("VENTE")}
                        className={`flex-1 ${transactionType === "VENTE" ? "bg-black text-white" : ""}`}
                    >
                        Acheter
                    </Button>
                    <Button
                        variant={transactionType === "LOCATION" ? "black" : "outline"}
                        onClick={() => setTransactionType("LOCATION")}
                        className={`flex-1 ${transactionType === "LOCATION" ? "bg-black text-white" : ""}`}
                    >
                        Louer
                    </Button>
                </div>

                {/* Search Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* City Input */}
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <Input 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Toutes les villes"
                            className="pl-10 h-12"
                        />
                    </div>

                    {/* Property Type Select */}
                    <Select value={propertyType} onValueChange={setPropertyType}>
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder="Tous les types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            {PROPERTY_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Search Button */}
                    <Button
                        onClick={handleSearch}
                        size="lg"
                        className="h-12 bg-blue-600 hover:bg-blue-700"
                    >
                        <Search className="w-5 h-5 mr-2" />
                        Rechercher
                    </Button>
                </div>
            </div>
        </div>
    );
}
