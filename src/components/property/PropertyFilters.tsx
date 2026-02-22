"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState } from "react";

const SENEGAL_CITIES = [
    "Dakar",
    "Thiès",
    "Saint-Louis",
    "Kaolack",
    "Ziguinchor",
    "Louga",
    "Mbour",
    "Rufisque",
    "Touba",
    "Diourbel",
];

const DAKAR_DISTRICTS = [
    "Almadies",
    "Mermoz",
    "Sacré-Cœur",
    "Plateau",
    "Point E",
    "Ngor",
    "Ouakam",
    "HLM",
    "Liberté",
    "Fann",
];

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

interface PropertyFiltersProps {
    onFilterChange?: (filters: any) => void;
    onClose?: () => void;
}

export function PropertyFilters({ onFilterChange, onClose }: PropertyFiltersProps) {
    const [filters, setFilters] = useState({
        transactionType: "VENTE",
        propertyType: "all",
        city: "all",
        district: "all",
        minPrice: 0,
        maxPrice: 1000000000,
        minSurface: 0,
        maxSurface: 1000,
        bedrooms: 0,
        hasParking: false,
        hasGarden: false,
        hasPool: false,
    });

    const updateFilter = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const resetFilters = () => {
        const defaultFilters = {
            transactionType: "VENTE",
            propertyType: "all",
            city: "all",
            district: "all",
            minPrice: 0,
            maxPrice: 1000000000,
            minSurface: 0,
            maxSurface: 1000,
            bedrooms: 0,
            hasParking: false,
            hasGarden: false,
            hasPool: false,
        };
        setFilters(defaultFilters);
        onFilterChange?.(defaultFilters);
    };

    const formatPrice = (price: number) => {
        return (price / 1000000).toFixed(0) + "M";
    };

    // Logique conditionnelle pour afficher les filtres selon le type de bien
    const showBedroomsFilter = () => {
        const type = filters.propertyType;
        // Pas de chambres pour: TERRAIN, COMMERCE, BUREAU
        return type === "all" || !["TERRAIN", "COMMERCE", "BUREAU"].includes(type);
    };

    const showPoolFilter = () => {
        const type = filters.propertyType;
        // Piscine uniquement pour: VILLA, MAISON, DUPLEX
        return type === "all" || ["VILLA", "MAISON", "DUPLEX"].includes(type);
    };

    const showGardenFilter = () => {
        const type = filters.propertyType;
        // Jardin pour: VILLA, MAISON, DUPLEX (pas TERRAIN car c'est déjà un espace extérieur)
        return type === "all" || ["VILLA", "MAISON", "DUPLEX"].includes(type);
    };

    const showParkingFilter = () => {
        const type = filters.propertyType;
        // Parking pour tous sauf TERRAIN
        return type === "all" || type !== "TERRAIN";
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Filtres</CardTitle>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Transaction Type */}
                <div className="space-y-2">
                    <Label>Type de transaction</Label>
                    <div className="flex gap-2">
                        <Button
                            variant={filters.transactionType === "VENTE" ? "default" : "outline"}
                            onClick={() => updateFilter("transactionType", "VENTE")}
                            className="flex-1"
                        >
                            Vente
                        </Button>
                        <Button
                            variant={filters.transactionType === "LOCATION" ? "default" : "outline"}
                            onClick={() => updateFilter("transactionType", "LOCATION")}
                            className="flex-1"
                        >
                            Location
                        </Button>
                    </div>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                    <Label>Type de bien</Label>
                    <Select value={filters.propertyType} onValueChange={(v) => updateFilter("propertyType", v)}>
                        <SelectTrigger>
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
                </div>

                {/* City */}
                <div className="space-y-2">
                    <Label>Ville</Label>
                    <Select value={filters.city} onValueChange={(v) => updateFilter("city", v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Toutes les villes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les villes</SelectItem>
                            {SENEGAL_CITIES.map((city) => (
                                <SelectItem key={city} value={city}>
                                    {city}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* District (if Dakar) */}
                {filters.city === "Dakar" && (
                    <div className="space-y-2">
                        <Label>Quartier</Label>
                        <Select value={filters.district} onValueChange={(v) => updateFilter("district", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tous les quartiers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les quartiers</SelectItem>
                                {DAKAR_DISTRICTS.map((district) => (
                                    <SelectItem key={district} value={district}>
                                        {district}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Price Range */}
                <div className="space-y-2">
                    <Label>Prix (FCFA)</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs text-gray-500">Min</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filters.minPrice || ""}
                                onChange={(e) => updateFilter("minPrice", parseInt(e.target.value) || 0)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">Max</Label>
                            <Input
                                type="number"
                                placeholder="1000000000"
                                value={filters.maxPrice === 1000000000 ? "" : filters.maxPrice}
                                onChange={(e) => updateFilter("maxPrice", parseInt(e.target.value) || 1000000000)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Surface Range */}
                <div className="space-y-2">
                    <Label>Surface (m²)</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs text-gray-500">Min</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filters.minSurface || ""}
                                onChange={(e) => updateFilter("minSurface", parseInt(e.target.value) || 0)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">Max</Label>
                            <Input
                                type="number"
                                placeholder="1000"
                                value={filters.maxSurface === 1000 ? "" : filters.maxSurface}
                                onChange={(e) => updateFilter("maxSurface", parseInt(e.target.value) || 1000)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Bedrooms - Only for residential properties */}
                {showBedroomsFilter() && (
                    <div className="space-y-2">
                        <Label>Chambres minimum</Label>
                        <Select
                            value={filters.bedrooms.toString()}
                            onValueChange={(v) => updateFilter("bedrooms", parseInt(v))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Toutes</SelectItem>
                                <SelectItem value="1">1+</SelectItem>
                                <SelectItem value="2">2+</SelectItem>
                                <SelectItem value="3">3+</SelectItem>
                                <SelectItem value="4">4+</SelectItem>
                                <SelectItem value="5">5+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Amenities - Conditional based on property type */}
                <div className="space-y-3">
                    <Label>Équipements</Label>
                    <div className="space-y-2">
                        {showParkingFilter() && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="parking"
                                    checked={filters.hasParking}
                                    onCheckedChange={(checked) => updateFilter("hasParking", checked)}
                                />
                                <label htmlFor="parking" className="text-sm cursor-pointer">
                                    Parking
                                </label>
                            </div>
                        )}
                        {showGardenFilter() && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="garden"
                                    checked={filters.hasGarden}
                                    onCheckedChange={(checked) => updateFilter("hasGarden", checked)}
                                />
                                <label htmlFor="garden" className="text-sm cursor-pointer">
                                    Jardin
                                </label>
                            </div>
                        )}
                        {showPoolFilter() && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="pool"
                                    checked={filters.hasPool}
                                    onCheckedChange={(checked) => updateFilter("hasPool", checked)}
                                />
                                <label htmlFor="pool" className="text-sm cursor-pointer">
                                    Piscine
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reset Button */}
                <Button variant="outline" onClick={resetFilters} className="w-full">
                    Réinitialiser les filtres
                </Button>
            </CardContent>
        </Card>
    );
}
