"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Eye, Heart, MessageSquare, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getMyProperties } from "@/lib/api";

interface Stats {
    totalProperties: number;
    totalViews: number;
    totalFavorites: number;
    totalMessages: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalProperties: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalMessages: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const properties = await getMyProperties();
            const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
            const totalFavorites = properties.reduce((sum, p) => sum + (p._count?.favorites || 0), 0);
            setStats({
                totalProperties: properties.length,
                totalViews,
                totalFavorites,
                totalMessages: 0, // TODO: endpoint messages à venir
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Mes Annonces",
            value: stats.totalProperties,
            icon: Home,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Vues Totales",
            value: stats.totalViews,
            icon: Eye,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Favoris",
            value: stats.totalFavorites,
            icon: Heart,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            title: "Messages",
            value: stats.totalMessages,
            icon: MessageSquare,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Tableau de bord
                </h1>
                <p className="text-gray-600">
                    Bienvenue, {user?.firstName || 'Agent'} ! Voici un aperçu de vos activités.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {loading ? "..." : stat.value}
                                        </p>
                                    </div>
                                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Properties */}
                <Card>
                    <CardHeader>
                        <CardTitle>Annonces Récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b">
                                <div>
                                    <p className="font-medium text-gray-900">Villa moderne aux Almadies</p>
                                    <p className="text-sm text-gray-500">Publiée il y a 2 jours</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Eye className="w-4 h-4" />
                                    <span>245</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b">
                                <div>
                                    <p className="font-medium text-gray-900">Appartement F4 à Mermoz</p>
                                    <p className="text-sm text-gray-500">Publiée il y a 5 jours</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Eye className="w-4 h-4" />
                                    <span>189</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-gray-900">Terrain à Saly</p>
                                    <p className="text-sm text-gray-500">Publiée il y a 1 semaine</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Eye className="w-4 h-4" />
                                    <span>156</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Taux de conversion</span>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <span className="font-semibold text-green-600">+12%</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <span className="text-gray-600">Engagement moyen</span>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                    <span className="font-semibold text-blue-600">+8%</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Conseil :</strong> Ajoutez plus de photos à vos annonces pour augmenter l'engagement de 25% en moyenne.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
