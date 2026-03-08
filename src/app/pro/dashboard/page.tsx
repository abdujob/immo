"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Home, Eye, Heart, MessageSquare, TrendingUp,
    PlusCircle, Building2, CheckCircle, Clock, Loader2
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyProperties, getContactsReceived } from "@/lib/api";

interface AgencyStats {
    totalProperties: number;
    activeProperties: number;
    totalViews: number;
    totalFavorites: number;
    totalContacts: number;
    agency: any | null;
}

export default function ProDashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<AgencyStats>({
        totalProperties: 0,
        activeProperties: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalContacts: 0,
        agency: null,
    });
    const [loading, setLoading] = useState(true);
    const [recentProperties, setRecentProperties] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch my properties using the helper
            const properties = await getMyProperties();

            const totalViews = properties.reduce((s: number, p: any) => s + (p.views || 0), 0);
            const totalFavs = properties.reduce((s: number, p: any) => s + (p._count?.favorites || 0), 0);
            const active = properties.filter((p: any) => p.status === 'ACTIVE').length;

            setRecentProperties(properties.slice(0, 5));
            setStats(prev => ({
                ...prev,
                totalProperties: properties.length,
                activeProperties: active,
                totalViews,
                totalFavorites: totalFavs,
            }));

            // Fetch received contacts using the helper
            const contacts = await getContactsReceived();
            const pending = contacts.filter((c: any) => c.status === 'PENDING').length;
            setStats(prev => ({ ...prev, totalContacts: pending }));

        } catch (err) {
            console.error('Error loading pro dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            </div>
        );
    }

    const statCards = [
        { title: "Annonces publiées", value: stats.totalProperties, icon: Home, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Annonces actives", value: stats.activeProperties, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
        { title: "Vues totales", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
        { title: "Favoris", value: stats.totalFavorites, icon: Heart, color: "text-red-500", bg: "bg-red-50" },
        { title: "Messages en attente", value: stats.totalContacts, icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                    <p className="text-gray-500 mt-1">
                        Bienvenue, <span className="font-semibold text-gray-700">{user?.firstName} {user?.lastName}</span>
                    </p>
                </div>
                <Link href="/properties/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nouvelle annonce
                    </Button>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card key={card.title} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-lg ${card.bg}`}>
                                        <Icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                                <p className="text-sm text-gray-500 mt-1">{card.title}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Properties */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Annonces récentes</CardTitle>
                    <Link href="/pro/annonces" className="text-sm text-blue-600 hover:underline">
                        Voir tout
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentProperties.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            <p>Aucune annonce publiée</p>
                            <Link href="/properties/new" className="mt-3 inline-block text-blue-600 text-sm hover:underline">
                                Publier votre première annonce →
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {recentProperties.map((prop) => (
                                <div key={prop.id} className="flex items-center justify-between py-3 gap-4">
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/properties/${prop.id}`}
                                            className="font-medium text-gray-900 hover:text-blue-600 truncate block"
                                        >
                                            {prop.title}
                                        </Link>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                            <span>{prop.city}</span>
                                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{prop.views}</span>
                                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{prop._count?.favorites ?? 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prop.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                            prop.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {prop.status === 'ACTIVE' ? 'Actif' : prop.status === 'PENDING' ? 'En attente' : prop.status}
                                        </span>
                                        <Link href={`/properties/${prop.id}/edit`} className="text-xs text-blue-600 hover:underline">
                                            Modifier
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/pro/annonces">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                <Home className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Gérer les annonces</p>
                                <p className="text-xs text-gray-500">Modifier, supprimer, mettre en avant</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/pro/messages">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors relative">
                                <MessageSquare className="w-5 h-5 text-orange-600" />
                                {stats.totalContacts > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {stats.totalContacts}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Messages</p>
                                <p className="text-xs text-gray-500">
                                    {stats.totalContacts > 0 ? `${stats.totalContacts} non lu(s)` : 'Aucun message en attente'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/pro/settings">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Paramètres agence</p>
                                <p className="text-xs text-gray-500">Profil, contact, zone</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
