"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Bed,
    Bath,
    Maximize,
    Car,
    TreePine,
    Waves,
    Phone,
    Mail,
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Property, parseImages, formatPrice } from "@/lib/api";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";

interface PropertyDetailClientProps {
    property: Property;
    similarProperties: Property[];
}

export default function PropertyDetailClient({ property, similarProperties }: PropertyDetailClientProps) {
    const { toggleFavorite, isFavorite } = useFavorites();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Parse and prefix images with backend URL
    const propertyImages = parseImages(property.images);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 text-sm text-gray-600">
                    <Link href="/" className="hover:text-blue-600">Accueil</Link>
                    {" / "}
                    <Link href="/properties" className="hover:text-blue-600">Annonces</Link>
                    {" / "}
                    <span className="text-gray-900">{property.title}</span>
                </div>

                {/* Image Gallery */}
                <div className="relative h-[500px] rounded-2xl overflow-hidden mb-8 group">
                    <Image
                        src={propertyImages[currentImageIndex]}
                        alt={property.title}
                        fill
                        className="object-cover"
                    />

                    {/* Navigation Buttons */}
                    {propertyImages.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={prevImage}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={nextImage}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {propertyImages.length}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-blue-600 text-white">
                            {property.transactionType}
                        </Badge>
                        {property.featured && (
                            <Badge className="bg-yellow-500 text-white">
                                ⭐ Vedette
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title and Price */}
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {property.title}
                                    </h1>
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="w-5 h-5 mr-2" />
                                        <span>{property.address}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => toggleFavorite(property.id)}
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="text-4xl font-bold text-blue-600">
                                {formatPrice(property.price)}
                                {property.transactionType === 'LOCATION' && (
                                    <span className="text-lg text-gray-500 font-normal">/mois</span>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4">Caractéristiques</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Maximize className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <div className="text-sm text-gray-500">Surface</div>
                                            <div className="font-semibold">{property.surface} m²</div>
                                        </div>
                                    </div>
                                    {property.bedrooms && (
                                        <div className="flex items-center gap-2">
                                            <Bed className="w-5 h-5 text-gray-600" />
                                            <div>
                                                <div className="text-sm text-gray-500">Chambres</div>
                                                <div className="font-semibold">{property.bedrooms}</div>
                                            </div>
                                        </div>
                                    )}
                                    {property.bathrooms && (
                                        <div className="flex items-center gap-2">
                                            <Bath className="w-5 h-5 text-gray-600" />
                                            <div>
                                                <div className="text-sm text-gray-500">Salles de bain</div>
                                                <div className="font-semibold">{property.bathrooms}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm text-gray-500">Type</div>
                                        <div className="font-semibold">{property.type}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Amenities */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4">Équipements</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {property.hasParking && (
                                        <div className="flex items-center gap-2">
                                            <Car className="w-5 h-5 text-blue-600" />
                                            <span>Parking</span>
                                        </div>
                                    )}
                                    {property.hasGarden && (
                                        <div className="flex items-center gap-2">
                                            <TreePine className="w-5 h-5 text-green-600" />
                                            <span>Jardin</span>
                                        </div>
                                    )}
                                    {property.hasPool && (
                                        <div className="flex items-center gap-2">
                                            <Waves className="w-5 h-5 text-cyan-600" />
                                            <span>Piscine</span>
                                        </div>
                                    )}
                                    {property.isFurnished && (
                                        <div className="flex items-center gap-2">
                                            <span>✓ Meublé</span>
                                        </div>
                                    )}
                                    {property.hasAirCon && (
                                        <div className="flex items-center gap-2">
                                            <span>✓ Climatisation</span>
                                        </div>
                                    )}
                                    {property.hasGuardian && (
                                        <div className="flex items-center gap-2">
                                            <span>✓ Gardien</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4">Description</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {property.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Similar Properties */}
                        {similarProperties.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold mb-4">Propriétés similaires</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {similarProperties.map((prop) => (
                                            <PropertyCard key={prop.id} property={prop} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Contact */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4">Contact</h2>

                                {property.agency ? (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">{property.agency.name}</h3>
                                            {property.agency.verified && (
                                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                                    ✓ Vérifié
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                <a href={`tel:${property.agency.phone}`} className="hover:text-blue-600">
                                                    {property.agency.phone}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                <a href={`mailto:${property.agency.email}`} className="hover:text-blue-600">
                                                    {property.agency.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-2">
                                            {property.owner.firstName} {property.owner.lastName}
                                        </h3>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                <a href={`tel:${property.owner.phone}`} className="hover:text-blue-600">
                                                    {property.owner.phone}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                <a href={`mailto:${property.owner.email}`} className="hover:text-blue-600">
                                                    {property.owner.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Appeler
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Envoyer un message
                                    </Button>
                                </div>

                                <div className="mt-6 pt-6 border-t text-sm text-gray-500">
                                    <div className="flex justify-between mb-2">
                                        <span>Référence</span>
                                        <span className="font-medium">#{property.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Vues</span>
                                        <span className="font-medium">{property.views}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
