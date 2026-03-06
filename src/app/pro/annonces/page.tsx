"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Eye, Heart, Pencil, Trash2, PlusCircle, Loader2,
    Building2, MapPin, Star
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import Image from "next/image";
import { getMyProperties, parseImages, formatPrice, Property } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Actif",
    PENDING: "En attente",
    SOLD: "Vendu",
    RENTED: "Loué",
    INACTIVE: "Inactif",
};
const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    SOLD: "bg-blue-100 text-blue-700",
    RENTED: "bg-purple-100 text-purple-700",
    INACTIVE: "bg-gray-100 text-gray-600",
};

export default function ProAnnoncesPage() {
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) load();
    }, [user]);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getMyProperties();
            setProperties(data);
        } catch {
            toast({ title: "Erreur", description: "Impossible de charger les annonces.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Supprimer "${title}" ?`)) return;
        setDeletingId(id);
        try {
            const res = await fetch(`${API_URL}/properties/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                setProperties(prev => prev.filter(p => p.id !== id));
                toast({ title: "✅ Annonce supprimée" });
            } else throw new Error();
        } catch {
            toast({ title: "Erreur", description: "Impossible de supprimer l'annonce.", variant: "destructive" });
        } finally {
            setDeletingId(null);
        }
    };

    if (authLoading || loading) {
        return <div className="flex justify-center py-24"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mes annonces</h1>
                    <p className="text-gray-500">{properties.length} annonce{properties.length > 1 ? 's' : ''} publiée{properties.length > 1 ? 's' : ''}</p>
                </div>
                <Link href="/properties/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nouvelle annonce
                    </Button>
                </Link>
            </div>

            {properties.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-16 text-gray-400">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium text-lg">Aucune annonce publiée</p>
                        <p className="text-sm mt-1">Créez votre première annonce pour commencer.</p>
                        <Link href="/properties/new">
                            <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Publier une annonce
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {properties.map((prop) => {
                        const images = parseImages(prop.images);
                        const imgSrc = images[0] || '/placeholder-property.svg';

                        return (
                            <Card key={prop.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                    <div className="flex gap-0">
                                        {/* Image */}
                                        <div className="relative w-36 h-28 flex-shrink-0 rounded-l-lg overflow-hidden">
                                            <Image
                                                src={imgSrc}
                                                alt={prop.title}
                                                fill
                                                className="object-cover"
                                            />
                                            {prop.featured && (
                                                <div className="absolute top-1 left-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[prop.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {STATUS_LABELS[prop.status] ?? prop.status}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">{prop.transactionType}</Badge>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 truncate">{prop.title}</h3>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    {prop.city}
                                                </div>
                                                <p className="text-sm font-bold text-blue-600 mt-1">{formatPrice(prop.price)}</p>
                                            </div>

                                            {/* Stats + Actions */}
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{prop.views}</span>
                                                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{prop._count?.favorites ?? 0}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/properties/${prop.id}/edit`}>
                                                        <Button size="sm" variant="outline" className="h-8">
                                                            <Pencil className="w-3 h-3 mr-1" />
                                                            Modifier
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                                                        disabled={deletingId === prop.id}
                                                        onClick={() => handleDelete(prop.id, prop.title)}
                                                    >
                                                        {deletingId === prop.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3 h-3" />
                                                        )}
                                                    </Button>
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
