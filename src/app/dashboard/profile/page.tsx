"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, User, Mail, Phone } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const profileSchema = z.object({
    firstName: z.string().min(2, 'Le prénom est trop court'),
    lastName: z.string().min(2, 'Le nom est trop court'),
    email: z.string().email('Email invalide'),
    phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                form.reset({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                });
                if (data.avatar) {
                    setAvatarUrl(data.avatar.startsWith('http') ? data.avatar : `${API_URL}${data.avatar}`);
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

            toast({
                title: "Succès",
                description: "Votre profil a été mis à jour.",
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
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/avatar`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setAvatarUrl(data.avatar.startsWith('http') ? data.avatar : `${API_URL}${data.avatar}`);
                toast({ title: "Avatar mis à jour" });
            }
        } catch (error) {
            console.error('Upload avatar error:', error);
            toast({ title: "Erreur upload", variant: "destructive" });
        }
    };

    if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;

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
                        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <User className="w-12 h-12" />
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
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Prénom</Label>
                                    <Input {...form.register("firstName")} />
                                    {form.formState.errors.firstName && (
                                        <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Nom</Label>
                                    <Input {...form.register("lastName")} />
                                    {form.formState.errors.lastName && (
                                        <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input {...form.register("email")} className="pl-9" disabled /> {/* Email often read-only */}
                                </div>
                                <p className="text-xs text-gray-500">L'adresse email ne peut pas être modifiée.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input {...form.register("phone")} className="pl-9" placeholder="+221 77 000 00 00" />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
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
            </div>
        </div>
    );
}
