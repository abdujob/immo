"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, User, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const profileSchema = z.object({
    firstName: z.string().min(2, 'Le prénom est trop court'),
    lastName: z.string().min(2, 'Le nom est trop court'),
    email: z.string().email('Email invalide'),
    phone: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
}
});

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [authLoading, isAuthenticated, router]);

    // Populate form from auth context user
    useEffect(() => {
        if (user) {
            form.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || ''
});
            if (user.avatar) {
                setAvatarUrl(user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`);
            }
        }
    }, [user, form]);

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;
        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify(data)
});

            if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

            // Resync the auth context with fresh data
            await refreshUser();

            toast({
                title: "✅ Profil mis à jour",
                description: "Vos informations ont été enregistrées avec succès."
});
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour le profil.",
                variant: "destructive"
});
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch(`${API_URL}/users/avatar`, {
                method: 'PATCH',
                credentials: 'include',
                body: formData
});

            if (response.ok) {
                const data = await response.json();
                const newAvatarUrl = data.avatar?.startsWith('http')
                    ? data.avatar
                    : `${API_URL}${data.avatar}`;
                setAvatarUrl(newAvatarUrl);
                // Resync auth context so the navbar avatar is updated too
                await refreshUser();
                toast({ title: "✅ Photo de profil mise à jour" });
            } else {
                throw new Error('Upload échoué');
            }
        } catch (error) {
            console.error('Upload avatar error:', error);
            toast({ title: "Erreur upload", variant: "destructive" });
        }
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            </div>
        );
    }

    if (!user) return null;

    const userInitials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

            <div className="grid gap-8">
                {/* Avatar Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Photo de profil</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                    <span className="text-2xl font-bold text-blue-600">{userInitials}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Camera className="w-4 h-4 mr-2" />
                                Changer la photo
                            </Button>
                            <p className="text-sm text-gray-500 mt-2">
                                JPG, PNG ou WEBP. Max 5MB.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations personnelles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Prénom</Label>
                                    <Input {...form.register("firstName")} id="firstName" />
                                    {form.formState.errors.firstName && (
                                        <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Nom</Label>
                                    <Input {...form.register("lastName")} id="lastName" />
                                    {form.formState.errors.lastName && (
                                        <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        {...form.register("email")}
                                        id="email"
                                        className="pl-9"
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-gray-500">L'adresse email ne peut pas être modifiée.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        {...form.register("phone")}
                                        id="phone"
                                        className="pl-9"
                                        placeholder="+221 77 000 00 00"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    'Enregistrer les modifications'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Account Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations du compte</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Rôle du compte
                            </div>
                            <span className="text-sm font-medium">
                                {user.role === 'ADMIN'
                                    ? 'Administrateur'
                                    : user.role === 'AGENCY_AGENT'
                                        ? 'Agent Immobilier'
                                        : 'Particulier'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <User className="w-4 h-4 text-blue-500" />
                                Identifiant
                            </div>
                            <span className="text-sm font-mono text-gray-400">{user.id?.slice(0, 8)}…</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
