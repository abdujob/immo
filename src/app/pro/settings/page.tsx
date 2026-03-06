"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Building2, Phone, Mail, Globe, MapPin, Camera,
    Save, Loader2, CheckCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AgencyData {
    id: string;
    name: string;
    description: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
    logo?: string;
    verified: boolean;
}

export default function ProSettingsPage() {
    const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [agency, setAgency] = useState<AgencyData | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // Personal profile form
    const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setProfileForm({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
        }
    }, [user]);

    useEffect(() => {
        if (user) loadAgency();
    }, [user]);

    const loadAgency = async () => {
        setLoading(true);
        try {
            // Try to get user's agency (if they are an AGENCY_AGENT)
            const res = await fetch(`${API_URL}/users/my-agency`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setAgency(data);
                if (data.logo) {
                    setLogoUrl(data.logo.startsWith('http') ? data.logo : `${API_URL}${data.logo}`);
                }
            }
        } catch {
            // User might not have an agency yet
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify(profileForm),
            });
            if (!res.ok) throw new Error();
            await refreshUser();
            toast({ title: "✅ Profil mis à jour" });
        } catch {
            toast({ title: "Erreur", description: "Impossible de sauvegarder.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const saveAgency = async () => {
        if (!user || !agency) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/agencies/${agency.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({
                    name: agency.name,
                    description: agency.description,
                    address: agency.address,
                    city: agency.city,
                    phone: agency.phone,
                    email: agency.email,
                    website: agency.website,
                }),
            });
            if (!res.ok) throw new Error();
            toast({ title: "✅ Agence mise à jour" });
        } catch {
            toast({ title: "Erreur", description: "Impossible de mettre à jour l'agence.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token || !agency) return;
        const fd = new FormData();
        fd.append('logo', file);
        try {
            const res = await fetch(`${API_URL}/agencies/${agency.id}/logo`, {
                method: 'PATCH',
                credentials: 'include',
                body: fd,
            });
            if (res.ok) {
                const data = await res.json();
                const url = data.logo?.startsWith('http') ? data.logo : `${API_URL}${data.logo}`;
                setLogoUrl(url);
                toast({ title: "✅ Logo mis à jour" });
            }
        } catch {
            toast({ title: "Erreur upload logo", variant: "destructive" });
        }
    };

    if (authLoading || loading) {
        return <div className="flex justify-center py-24"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid grid-cols-2 max-w-xs">
                    <TabsTrigger value="profile">Mon profil</TabsTrigger>
                    <TabsTrigger value="agency">Mon agence</TabsTrigger>
                </TabsList>

                {/* PERSONAL PROFILE */}
                <TabsContent value="profile">
                    <Card className="max-w-xl">
                        <CardHeader>
                            <CardTitle>Informations personnelles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Prénom</Label>
                                    <Input
                                        value={profileForm.firstName}
                                        onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nom</Label>
                                    <Input
                                        value={profileForm.lastName}
                                        onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input value={user?.email} className="pl-9" disabled />
                                </div>
                                <p className="text-xs text-gray-500">L'email ne peut pas être modifié.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Téléphone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        value={profileForm.phone}
                                        className="pl-9"
                                        placeholder="+221 77 000 00 00"
                                        onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 p-3 bg-gray-50 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-600">Rôle : <strong>Agent Immobilier</strong></span>
                            </div>

                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={saveProfile} disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Enregistrer
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AGENCY SETTINGS */}
                <TabsContent value="agency">
                    {!agency ? (
                        <Card>
                            <CardContent className="text-center py-12 text-gray-500">
                                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                <p className="font-medium">Aucune agence associée à votre compte.</p>
                                <p className="text-sm mt-1">Contactez un administrateur pour rattacher votre compte à une agence.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6 max-w-xl">
                            {/* Logo */}
                            <Card>
                                <CardContent className="p-5 flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                                        <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                                            <Camera className="w-4 h-4 mr-2" />
                                            Changer le logo
                                        </Button>
                                        {agency.verified && (
                                            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                                <CheckCircle className="w-3 h-3" />
                                                Agence vérifiée
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Informations de l'agence</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nom de l'agence</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                value={agency.name}
                                                className="pl-9"
                                                onChange={e => setAgency(a => a ? { ...a, name: e.target.value } : a)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={agency.description || ''}
                                            rows={3}
                                            placeholder="Décrivez votre agence..."
                                            onChange={e => setAgency(a => a ? { ...a, description: e.target.value } : a)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Adresse</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    value={agency.address || ''}
                                                    className="pl-9"
                                                    onChange={e => setAgency(a => a ? { ...a, address: e.target.value } : a)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ville</Label>
                                            <Input
                                                value={agency.city || ''}
                                                onChange={e => setAgency(a => a ? { ...a, city: e.target.value } : a)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Téléphone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    value={agency.phone || ''}
                                                    className="pl-9"
                                                    onChange={e => setAgency(a => a ? { ...a, phone: e.target.value } : a)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    value={agency.email || ''}
                                                    className="pl-9"
                                                    onChange={e => setAgency(a => a ? { ...a, email: e.target.value } : a)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Site web</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                value={agency.website || ''}
                                                className="pl-9"
                                                placeholder="https://monagence.sn"
                                                onChange={e => setAgency(a => a ? { ...a, website: e.target.value } : a)}
                                            />
                                        </div>
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={saveAgency} disabled={saving}>
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Enregistrer les modifications
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
