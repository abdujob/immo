"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Calendar, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function ProDashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            try {
                // Fetch Profile
                const profileRes = await fetch('http://localhost:4000/coiffeurs/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setProfile(profileData);
                }

                // Fetch Stats
                const statsRes = await fetch('http://localhost:4000/appointments/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) return <div className="p-8">Chargement du tableau de bord...</div>;
    if (!profile) return <div className="p-8">Erreur de chargement. Veuillez vous reconnecter.</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                    <p className="text-muted-foreground">Bonjour {profile.firstName}, voici vos performances du jour.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
                        En ligne
                    </Badge>
                    <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus du jour</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.revenueToday || 0}€</div>
                        <p className="text-xs text-muted-foreground">
                            CA du jour
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rendez-vous</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.appointmentsToday || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Aujourd'hui
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taux de remplissage</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--%</div>
                        <p className="text-xs text-muted-foreground">
                            Non calculé
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.rating || 0}/5</div>
                        <p className="text-xs text-muted-foreground">
                            Basé sur vos avis
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Activity */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart Area */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Aperçu des revenus</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed text-muted-foreground text-sm">
                            Graphique des revenus (À venir)
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Sales/Activity */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Activité Récente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats?.recent?.length > 0 ? stats.recent.map((appt: any) => (
                                <div key={appt.id} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs ring-2 ring-white">
                                        {appt.client?.email?.[0]?.toUpperCase() || 'C'}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{appt.client?.email}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(appt.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm">+{appt.priceTotal}€</div>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-sm">Aucune activité récente.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
