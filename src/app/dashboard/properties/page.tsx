"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Property, parseImages, formatPrice, getMyProperties, updatePropertyStatus, updatePropertyFeatured } from "@/lib/api";

export default function MyPropertiesPage() {
    const { toast } = useToast();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyProperties();
    }, []);

    const loadMyProperties = async () => {
        setLoading(true);
        try {
            const data = await getMyProperties();
            // If not authenticated, getMyProperties returns [] and we redirect
            if (data.length === 0 && !localStorage.getItem('token')) {
                window.location.href = '/auth/login';
                return;
            }
            setProperties(data);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
        try {
            const user = localStorage.getItem('user');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await fetch(`${API_URL}/properties/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                setProperties(prev => prev.filter(p => p.id !== id));
                toast({ title: "Succès", description: "L'annonce a été supprimée." });
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            toast({ title: "Erreur", description: "Impossible de supprimer l'annonce.", variant: "destructive" });
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const success = await updatePropertyStatus(id, newStatus);
        if (success) {
            setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
            toast({ title: "Statut mis à jour", description: `L'annonce est maintenant ${newStatus}.` });
        } else {
            toast({ title: "Erreur", description: "Impossible de changer le statut.", variant: "destructive" });
        }
    };

    const handleFeaturedToggle = async (id: string, currentlyFeatured: boolean) => {
        const newFeatured = !currentlyFeatured;
        const success = await updatePropertyFeatured(id, newFeatured);
        if (success) {
            setProperties(prev => prev.map(p => p.id === id ? { ...p, featured: newFeatured } : p));
            toast({ title: "Mise en vedette modifiée", description: newFeatured ? "Annonce mise en vedette." : "Mise en vedette retirée." });
        } else {
            toast({ title: "Erreur", description: "Impossible de modifier la mise en vedette.", variant: "destructive" });
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
                        const images = parseImages(property.images);
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
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-between">
                                                        <span>{property.title}</span>
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
                                                <div className="flex flex-col gap-2 items-end">
                                                    <div className="flex gap-2">
                                                        <Link href={`/properties/${property.id}/edit`}>
                                                            <Button variant="outline" size="icon" title="Modifier">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="icon" title="Statut">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleStatusChange(property.id, 'ACTIVE')}>Actif</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(property.id, 'SOLD')}>Vendu</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(property.id, 'RENTED')}>Loué</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(property.id, 'INACTIVE')}>Inactif</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleDelete(property.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-4 border-b pb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-semibold px-2 py-1 rounded border 
                                                        ${property.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            property.status === 'SOLD' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                property.status === 'RENTED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                    'bg-gray-100 text-gray-700 border-gray-300'}`}>
                                                        {property.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-600 text-right">Vedette</span>
                                                    <Switch
                                                        checked={property.featured}
                                                        onCheckedChange={() => handleFeaturedToggle(property.id, property.featured)}
                                                    />
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
