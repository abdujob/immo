"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, Phone, Mail, Globe, Star, Loader2, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { submitReview } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AgencyDetailClient({ agency }: { agency: any }) {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();

    const [reviews, setReviews] = useState<any[]>(agency.reviews || []);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast({ title: "Connexion requise", description: "Veuillez vous connecter.", variant: "destructive" });
            return;
        }

        setReviewLoading(true);
        const success = await submitReview({
            targetType: 'AGENCY',
            agencyId: agency.id,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
        });
        setReviewLoading(false);

        if (success) {
            toast({ title: "Merci", description: "Votre avis a été publié avec succès." });
            setShowReviewForm(false);
            setReviewForm({ rating: 5, comment: '' });
            // Simulation
        } else {
            toast({ title: "Erreur", description: "Impossible de publier l'avis.", variant: "destructive" });
        }
    };

    const logoUrl = agency.logo
        ? (agency.logo.startsWith('http') ? agency.logo : `${API_URL}${agency.logo}`)
        : null;

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Agency Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Logo */}
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-white shadow-lg flex items-center justify-center p-4 border flex-shrink-0 relative overflow-hidden">
                            {logoUrl ? (
                                <Image src={logoUrl} alt={agency.name} fill className="object-contain p-4" />
                            ) : (
                                <Building2 className="w-16 h-16 md:w-24 md:h-24 text-gray-300" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-5xl font-bold text-gray-900">{agency.name}</h1>
                                {agency.verified && <Badge className="bg-green-500 text-white mt-2 lg:mt-0 text-sm">Vérifiée</Badge>}
                            </div>

                            <p className="text-gray-600 mb-6 max-w-2xl text-lg">
                                {agency.description || 'Spécialiste de l\'immobilier au Sénégal.'}
                            </p>

                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    <span>{agency.address}, {agency.city}</span>
                                </div>
                                {agency.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-blue-600" />
                                        <a href={`tel:${agency.phone}`} className="hover:text-blue-600 font-medium">{agency.phone}</a>
                                    </div>
                                )}
                                {agency.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        <a href={`mailto:${agency.email}`} className="hover:text-blue-600 font-medium">{agency.email}</a>
                                    </div>
                                )}
                                {agency.website && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-blue-600" />
                                        <a href={agency.website} target="_blank" rel="noreferrer" className="hover:text-blue-600 font-medium cursor-pointer">Visiter le site web</a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4 md:flex-col items-center md:items-end w-full md:w-auto">
                            <div className="text-center md:text-right">
                                <div className="text-3xl font-bold text-blue-600">{agency.properties?.length || 0}</div>
                                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Annonces</div>
                            </div>
                            <div className="text-center md:text-right">
                                <div className="text-3xl font-bold text-gray-900">{agency.agents?.length || 0}</div>
                                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Agents</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column : Properties */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center mb-6">
                            <Home className="w-6 h-6 text-gray-400 mr-2" />
                            <h2 className="text-2xl font-bold text-gray-900">Annonces de l'agence</h2>
                        </div>

                        {(!agency.properties || agency.properties.length === 0) ? (
                            <div className="bg-white rounded-xl p-12 text-center border">
                                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Cette agence n'a pas encore publié d'annonces.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {agency.properties.map((property: any) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column : Agents & Reviews */}
                    <div className="space-y-8">

                        {/* Agents */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold mb-4">L'équipe</h3>
                                <div className="space-y-4">
                                    {(agency.agents || []).map((agent: any) => (
                                        <div key={agent.id} className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden relative bg-gray-100 border">
                                                {agent.avatar ? (
                                                    <Image src={agent.avatar.startsWith('http') ? agent.avatar : `${API_URL}${agent.avatar}`} alt={agent.firstName} fill className="object-cover" />
                                                ) : (
                                                    <span className="flex items-center justify-center w-full h-full text-gray-400 font-bold">
                                                        {agent.firstName?.charAt(0)}{agent.lastName?.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{agent.firstName} {agent.lastName}</div>
                                                <a href={`mailto:${agent.email}`} className="text-sm text-blue-600 hover:underline">{agent.email}</a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reviews */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">Avis Clients ({reviews.length})</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (!isAuthenticated) toast({ title: "Connexion requise", description: "Connectez-vous pour laisser un avis." });
                                            else setShowReviewForm(!showReviewForm);
                                        }}
                                    >
                                        Écrire
                                    </Button>
                                </div>

                                {showReviewForm && (
                                    <form onSubmit={handleReviewSubmit} className="mb-6 p-4 border rounded-xl bg-gray-50 space-y-4">
                                        <div>
                                            <Label>Note</Label>
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button type="button" key={star} onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}>
                                                        <Star className={`w-5 h-5 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="agency-review">Commentaire</Label>
                                            <Textarea id="agency-review" rows={3} required value={reviewForm.comment} onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>Annuler</Button>
                                            <Button type="submit" size="sm" disabled={reviewLoading} className="bg-blue-600 text-white">
                                                {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publier'}
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {reviews.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Aucun avis pour cette agence.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.map((r, i) => (
                                            <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="text-sm font-semibold">{r.author?.firstName} {r.author?.lastName}</div>
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, j) => (
                                                            <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600">{r.comment}</p>
                                                <div className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
