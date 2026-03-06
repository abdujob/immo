"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertySkeleton } from "@/components/property/PropertySkeleton"; // Added this import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Search, SlidersHorizontal, X, Loader2, MapPin,
    ChevronDown, ChevronUp, Home, DollarSign, Maximize
} from "lucide-react";
import { searchProperties, Property } from "@/lib/api";
import { MapView } from "@/components/search/MapView";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const PROPERTY_TYPES = ['APPARTEMENT', 'MAISON', 'VILLA', 'TERRAIN', 'BUREAU', 'COMMERCE', 'STUDIO', 'DUPLEX'];
const CITIES = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Mbour', 'Touba', 'Diourbel', 'Rufisque'];

interface Filters {
    q: string;
    transactionType: string;
    propertyType: string;
    city: string;
    minPrice: string;
    maxPrice: string;
    minSurface: string;
    maxSurface: string;
    bedrooms: string;
    hasParking: boolean;
    hasGarden: boolean;
    hasPool: boolean;
}

const DEFAULT_FILTERS: Filters = {
    q: '', transactionType: '', propertyType: '', city: '',
    minPrice: '', maxPrice: '', minSurface: '', maxSurface: '',
    bedrooms: '', hasParking: false, hasGarden: false, hasPool: false,
};

function FilterPanel({ filters, setFilters, onSearch, loading, isMobile, onClose }: {
    filters: Filters;
    setFilters: (f: Filters) => void;
    onSearch: () => void;
    loading: boolean;
    isMobile?: boolean;
    onClose?: () => void;
}) {
    const update = (key: keyof Filters, val: any) => setFilters({ ...filters, [key]: val });
    const activeCount = Object.entries(filters).filter(([k, v]) => k !== 'q' && (v === true || (typeof v === 'string' && v !== ''))).length;

    return (
        <div className={`bg - white ${isMobile ? '' : 'border-r'} h - full overflow - y - auto`}>
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                        <h2 className="font-semibold text-gray-900">Filtres</h2>
                        {activeCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">{activeCount}</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {activeCount > 0 && (
                            <button
                                onClick={() => setFilters(DEFAULT_FILTERS)}
                                className="text-xs text-gray-500 hover:text-red-500"
                            >
                                Réinitialiser
                            </button>
                        )}
                        {isMobile && onClose && (
                            <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
                        )}
                    </div>
                </div>

                {/* Search bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Ville, quartier, adresse..."
                        className="pl-9"
                        value={filters.q}
                        onChange={e => update('q', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onSearch()}
                    />
                </div>
            </div>

            <div className="p-4 space-y-5">
                {/* Transaction type */}
                <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Transaction</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {[{ val: '', label: 'Tous' }, { val: 'VENTE', label: 'Vente' }, { val: 'LOCATION', label: 'Location' }].map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => update('transactionType', opt.val)}
                                className={`py - 2 text - sm rounded - lg border transition - colors ${filters.transactionType === opt.val
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                                    } `}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Property type */}
                <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Type de bien</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                        {PROPERTY_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => update('propertyType', filters.propertyType === type ? '' : type)}
                                className={`py - 1.5 text - xs rounded - lg border transition - colors ${filters.propertyType === type
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                                    } `}
                            >
                                {type.charAt(0) + type.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* City */}
                <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Ville
                    </Label>
                    <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.city}
                        onChange={e => update('city', e.target.value)}
                    >
                        <option value="">Toutes les villes</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Price range */}
                <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Prix (FCFA)
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={e => update('minPrice', e.target.value)}
                            className="text-sm"
                        />
                        <Input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={e => update('maxPrice', e.target.value)}
                            className="text-sm"
                        />
                    </div>
                </div>

                {/* Surface */}
                <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
                        <Maximize className="w-3 h-3" /> Surface (m²)
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="Min" value={filters.minSurface} onChange={e => update('minSurface', e.target.value)} className="text-sm" />
                        <Input type="number" placeholder="Max" value={filters.maxSurface} onChange={e => update('maxSurface', e.target.value)} className="text-sm" />
                    </div>
                </div>

                {/* Bedrooms */}
                <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
                        <Home className="w-3 h-3" /> Chambres minimum
                    </Label>
                    <div className="flex gap-2">
                        {['', '1', '2', '3', '4', '5'].map(n => (
                            <button
                                key={n}
                                onClick={() => update('bedrooms', n)}
                                className={`flex - 1 py - 1.5 text - sm rounded - lg border transition - colors ${filters.bedrooms === n
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                                    } `}
                            >
                                {n === '' ? 'Tous' : n === '5' ? '5+' : n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amenities */}
                <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Équipements</Label>
                    <div className="space-y-2">
                        {[
                            { key: 'hasParking', label: '🚗 Parking' },
                            { key: 'hasGarden', label: '🌿 Jardin' },
                            { key: 'hasPool', label: '🏊 Piscine' },
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters[key as keyof Filters] as boolean}
                                    onChange={e => update(key as keyof Filters, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={onSearch}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                    Rechercher
                </Button>
            </div>
        </div>
    );
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [filters, setFilters] = useState<Filters>({
        q: searchParams.get('q') || '',
        transactionType: searchParams.get('transactionType') || '',
        propertyType: searchParams.get('type') || '',
        city: searchParams.get('city') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minSurface: searchParams.get('minSurface') || '',
        maxSurface: searchParams.get('maxSurface') || '',
        bedrooms: searchParams.get('bedrooms') || '',
        hasParking: searchParams.get('hasParking') === 'true',
        hasGarden: searchParams.get('hasGarden') === 'true',
        hasPool: searchParams.get('hasPool') === 'true',
    });

    const [results, setResults] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const doSearch = useCallback(async (f: Filters) => {
        setLoading(true);
        try {
            const data = await searchProperties({
                city: f.q || f.city || undefined,
                propertyType: f.propertyType || undefined,
                transactionType: (f.transactionType || undefined) as any,
                minPrice: f.minPrice ? Number(f.minPrice) : undefined,
                maxPrice: f.maxPrice ? Number(f.maxPrice) : undefined,
                minSurface: f.minSurface ? Number(f.minSurface) : undefined,
                maxSurface: f.maxSurface ? Number(f.maxSurface) : undefined,
                bedrooms: f.bedrooms ? Number(f.bedrooms) : undefined,
                hasParking: f.hasParking || undefined,
                hasGarden: f.hasGarden || undefined,
                hasPool: f.hasPool || undefined,
            });
            setResults(data);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        doSearch(filters);
    }, []);

    const handleSearch = () => {
        // Sync URL
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        if (filters.transactionType) params.set('transactionType', filters.transactionType);
        if (filters.propertyType) params.set('type', filters.propertyType);
        if (filters.city) params.set('city', filters.city);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.minSurface) params.set('minSurface', filters.minSurface);
        if (filters.maxSurface) params.set('maxSurface', filters.maxSurface);
        if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
        if (filters.hasParking) params.set('hasParking', 'true');
        if (filters.hasGarden) params.set('hasGarden', 'true');
        if (filters.hasPool) params.set('hasPool', 'true');
        router.replace(`/ search ? ${params.toString()} `, { scroll: false });
        doSearch(filters);
        setShowMobileFilters(false);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
            {/* Mobile filter overlay */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
                    <div className="absolute left-0 top-0 bottom-0 w-80 shadow-xl" onClick={e => e.stopPropagation()}>
                        <FilterPanel filters={filters} setFilters={setFilters} onSearch={handleSearch} loading={loading} isMobile onClose={() => setShowMobileFilters(false)} />
                    </div>
                </div>
            )}

            {/* Desktop filter sidebar */}
            <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0 overflow-y-auto border-r bg-white">
                <FilterPanel filters={filters} setFilters={setFilters} onSearch={handleSearch} loading={loading} />
            </div>

            {/* Results */}
            <div className={`flex - 1 overflow - y - auto ${showMap ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'} `}>
                {/* Topbar */}
                <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-700 border rounded-lg px-3 py-2 hover:bg-gray-50"
                            onClick={() => setShowMobileFilters(true)}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filtres
                        </button>
                        <span className="text-sm text-gray-500">
                            {loading ? 'Recherche...' : `${results.length} résultat${results.length > 1 ? 's' : ''} `}
                        </span>
                    </div>
                    <button
                        className="text-sm text-blue-600 hover:underline hidden sm:block"
                        onClick={() => setShowMap(m => !m)}
                    >
                        {showMap ? 'Voir la liste' : 'Voir la carte'}
                    </button>
                </div>

                {/* Cards */}
                <div className="p-4">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <PropertySkeleton key={i} />
                            ))}
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p className="font-medium">Aucun bien immobilier trouvé</p>
                            <p className="text-sm mt-1">Essayez des critères moins restrictifs</p>
                            <button
                                className="mt-4 text-sm text-blue-600 hover:underline"
                                onClick={() => { setFilters(DEFAULT_FILTERS); doSearch(DEFAULT_FILTERS); }}
                            >
                                Effacer tous les filtres
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.map((prop) => (
                                <PropertyCard key={prop.id} property={prop as any} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Map panel */}
            <div className={`${showMap ? 'flex-1' : 'hidden'} lg:flex lg:w-1/2 xl:w-2/5 flex-shrink-0`}>
                <div className="w-full h-full bg-gray-100">
                    <MapView />
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
            <SearchContent />
        </Suspense>
    );
}
