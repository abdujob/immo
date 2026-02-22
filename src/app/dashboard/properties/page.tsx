"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Eye,
    Heart,
    Edit,
    Trash2,
    Plus,
    MoreVertical,
    MapPin
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Property, parseImages, formatPrice } from "@/lib/api";

export default function MyPropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyProperties();
    }, []);

    const loadMyProperties = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/auth/login';
                return;
            }

            const response = await fetch('http://localhost:4000/properties/my-properties', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProperties(data);
            }
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:4000/properties/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setProperties(prev => prev.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error deleting property:', error);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Chargement...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Annonces</h1>
                    <p className="text-gray-600">
                        {properties.length} {properties.length > 1 ? 'annonces publiées' : 'annonce publiée'}
                    </p>
                </div>
                <Link href="/properties/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle annonce
                    </Button>
                </Link>
            </div>

            {/* Properties List */}
            {properties.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Aucune annonce
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Commencez à publier vos biens immobiliers pour les rendre visibles aux acheteurs et locataires.
                            </p>
                            <Link href="/properties/new">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Créer ma première annonce
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {properties.map((property) => {
                        // Robust image parsing with API URL prefix
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                        let images: string[] = [];

                        try {
                            let rawImages: string[] = [];
                            if (Array.isArray(property.images)) {
                                // @ts-ignore
                                rawImages = property.images;
                            } else {
                                rawImages = parseImages(property.images);
                            }

                            // Ensure all images have the correct prefix
                            images = rawImages.map((img: string) => {
                                if (img.startsWith('/uploads')) {
                                    return img.startsWith('http') ? img : `${API_URL}${img}`;
                                }
                                return img;
                            });
                        } catch (e) {
                            console.error("Image parsing error", e);
                            images = ['/placeholder-property.svg'];
                        }
                        const mainImage = images[0] || '/placeholder-property.svg';

                        return (
                            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Image */}
                                        <div className="relative w-full md:w-64 h-48 flex-shrink-0">
                                            <Image
                                                src={mainImage}
                                                alt={property.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                                                {property.transactionType}
                                            </Badge>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                        {property.title}
                                                    </h3>
                                                    <div className="flex items-center text-gray-600 text-sm mb-3">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        <span>{property.address}</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {formatPrice(property.price)}
                                                        {property.transactionType === 'LOCATION' && (
                                                            <span className="text-sm text-gray-500 font-normal">/mois</span>
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Link href={`/properties/${property.id}/edit`}>
                                                        <Button variant="outline" size="icon">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleDelete(property.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>{property.views || 0} vues</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{property._count?.favorites || 0} favoris</span>
                                                </div>
                                                <div className="text-gray-400">
                                                    Publié le {new Date(property.createdAt).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
