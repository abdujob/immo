"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Maximize, Car, TreePine, Waves } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { parseImages, parseVideos, formatPrice } from "@/lib/api";

interface PropertyCardProps {
    property: {
        id: string;
        title: string;
        description: string;
        type: string;
        transactionType: string;
        price: number;
        surface: number;
        bedrooms?: number;
        bathrooms?: number;
        hasParking?: boolean;
        hasGarden?: boolean;
        hasPool?: boolean;
        city: string;
        district?: string;
        images?: string | string[];
        videos?: string | string[];
        featured?: boolean;
        owner: {
            firstName: string;
            lastName: string;
        };
        agency?: {
            name: string;
        };
        _count?: {
            favorites: number;
        };
    };
    onFavoriteToggle?: (propertyId: string) => void;
    isFavorite?: boolean;
}

export function PropertyCard({ property, onFavoriteToggle, isFavorite = false }: PropertyCardProps) {
    const [imageError, setImageError] = useState(false);

    const getTransactionBadgeColor = (type: string) => {
        return type === 'VENTE' ? 'bg-blue-600' : 'bg-green-600';
    };

    const propertyImages = parseImages(property.images, false);
    const propertyVideos = parseVideos(property.videos);

    return (
        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
            <Link href={`/properties/${property.id}`}>
                <div className="relative h-56 overflow-hidden">
                    {propertyImages.length > 0 && !imageError ? (
                        <Image
                            src={propertyImages[0]}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={() => setImageError(true)}
                        />
                    ) : propertyVideos.length > 0 ? (
                        <video
                            src={propertyVideos[0]}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            muted
                            playsInline
                            loop
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <MapPin className="w-16 h-16 text-blue-400" />
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={`${getTransactionBadgeColor(property.transactionType)} text-white`}>
                            {property.transactionType}
                        </Badge>
                        {property.featured && (
                            <Badge className="bg-yellow-500 text-white">
                                ⭐ Vedette
                            </Badge>
                        )}
                    </div>

                    {/* Favorite Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFavoriteToggle?.(property.id);
                        }}
                    >
                        <Heart
                            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                        />
                    </Button>
                </div>
            </Link>

            <CardContent className="p-4">
                <Link href={`/properties/${property.id}`} className="block">
                    {/* Price */}
                    <div className="mb-2">
                        <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(property.price)}
                            {property.transactionType === 'LOCATION' && (
                                <span className="text-sm text-gray-500 font-normal">/mois</span>
                            )}
                        </p>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {property.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                            {property.district ? `${property.district}, ` : ''}{property.city}
                        </span>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                            <Maximize className="w-4 h-4" />
                            <span>{property.surface} m²</span>
                        </div>
                        {property.bedrooms && (
                            <div className="flex items-center gap-1">
                                <Bed className="w-4 h-4" />
                                <span>{property.bedrooms} ch.</span>
                            </div>
                        )}
                        {property.bathrooms && (
                            <div className="flex items-center gap-1">
                                <Bath className="w-4 h-4" />
                                <span>{property.bathrooms} sdb</span>
                            </div>
                        )}
                    </div>

                    {/* Amenities */}
                    {(property.hasParking || property.hasGarden || property.hasPool) && (
                        <div className="flex gap-2 mb-3">
                            {property.hasParking && (
                                <Badge variant="outline" className="text-xs">
                                    <Car className="w-3 h-3 mr-1" />
                                    Parking
                                </Badge>
                            )}
                            {property.hasGarden && (
                                <Badge variant="outline" className="text-xs">
                                    <TreePine className="w-3 h-3 mr-1" />
                                    Jardin
                                </Badge>
                            )}
                            {property.hasPool && (
                                <Badge variant="outline" className="text-xs">
                                    <Waves className="w-3 h-3 mr-1" />
                                    Piscine
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Owner/Agency */}
                    <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            {property.agency ? (
                                <span className="font-medium text-blue-600">{property.agency.name}</span>
                            ) : (
                                <span>Par {property.owner.firstName} {property.owner.lastName}</span>
                            )}
                        </p>
                    </div>
                </Link>
            </CardContent>
        </Card>
    );
}
