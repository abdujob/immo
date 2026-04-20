"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    MapPin, Bed, Bath, Maximize, Car, TreePine, Waves,
    Phone, Mail, Heart, Share2, ChevronLeft, ChevronRight,
    Loader2, CheckCircle2, Wind, Shield, Home, Star, Play
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Property, parseImages, parseVideos, formatPrice, submitReview, sendContact } from "@/lib/api";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface PropertyDetailClientProps {
    property: Property;
    similarProperties: Property[];
}

export default function PropertyDetailClient({ property, similarProperties }: PropertyDetailClientProps) {
    const { toggleFavorite, isFavorite } = useFavorites();
    const { isAuthenticated, user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);
    const [contactSent, setContactSent] = useState(false);
    const [contactForm, setContactForm] = useState({
        message: '',
        phone: ''
    });

    const [reviews, setReviews] = useState<any[]>(property.reviews || []);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    const propertyImages = parseImages(property.images);
    const propertyVideos = parseVideos(property.videos);
    const isPropertyFavorite = isFavorite(property.id);

    // Combine images and videos into a single media array
    const allMedia = [
        ...propertyImages.map(url => ({ type: 'image' as const, url })),
        ...propertyVideos.map(url => ({ type: 'video' as const, url }))
    ];

    const nextMedia = () => setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
    const prevMedia = () => setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);

    const handleFavoriteClick = async () => {
        if (!isAuthenticated) {
            toast({
                title: "Connexion requise",
                description: "Connectez-vous pour ajouter aux favoris.",
                variant: "destructive"
            });
            return;
        }
        await toggleFavorite(property.id);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: property.title,
                url: window.location.href
            }).catch(() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "✅ Lien copié" });
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({ title: "✅ Lien copié dans le presse-papiers" });
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast({ title: "Connexion requise", description: "Connectez-vous pour envoyer un message.", variant: "destructive" });
            return;
        }

        const message = contactForm.message.trim();
        if (!message) {
            toast({
                title: "Message vide",
                description: "Le message ne peut pas être vide.",
                variant: "destructive"
            });
            return;
        }


        setContactLoading(true);
        try {
            const success = await sendContact(
                property.id,
                message,
                contactForm.phone.trim() || undefined
            );

            if (!success) throw new Error('Erreur envoi');

            setContactSent(true);
            setContactForm({ message: '', phone: '' });
            toast({ title: "✅ Message envoyé", description: "Le propriétaire vous contactera bientôt." });
        } catch {
            toast({ title: "Erreur", description: "Impossible d'envoyer le message.", variant: "destructive" });
        } finally {
            setContactLoading(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast({ title: "Connexion requise", description: "Connectez-vous pour laisser un avis.", variant: "destructive" });
            return;
        }

        setReviewLoading(true);
        const success = await submitReview({
            targetType: 'PROPERTY',
            propertyId: property.id,
            rating: reviewForm.rating,
            comment: reviewForm.comment
        });

        setReviewLoading(false);

        if (success) {
            toast({ title: "Merci", description: "Votre avis a été publié avec succès." });
            setShowReviewForm(false);
            setReviewForm({ rating: 5, comment: '' });
        } else {
            toast({ title: "Erreur", description: "Impossible de publier l'avis.", variant: "destructive" });
        }
    };

    const contactName = property.agency?.name ?? `${property.owner.firstName} ${property.owner.lastName}`;
    const contactPhone = property.agency?.phone ?? property.owner.phone;
    const contactEmail = property.agency?.email ?? property.owner.email;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 text-sm text-gray-600 flex items-center gap-1">
                    <Link href="/" className="hover:text-blue-600">Accueil</Link>
                    <span>/</span>
                    <Link href="/properties" className="hover:text-blue-600">Annonces</Link>
                    <span>/</span>
                    <span className="text-gray-900 truncate max-w-xs">{property.title}</span>
                </div>

                {/* Media Gallery (Images + Videos) */}
                <div className="relative h-[500px] rounded-2xl overflow-hidden mb-8 group shadow-lg bg-black/5">
                    {allMedia[currentMediaIndex].type === 'image' ? (
                        <Image
                            src={allMedia[currentMediaIndex].url}
                            alt={property.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                            <video
                                src={allMedia[currentMediaIndex].url}
                                className="w-full h-full"
                                controls
                                crossOrigin="anonymous"
                                preload="auto"
                            />
                        </div>
                    )}

                    {allMedia.length > 1 && (
                        <>
                            <button
                                onClick={prevMedia}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow z-10"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextMedia}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow z-10"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* Thumbnails/Indicators bar */}
                    {allMedia.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {allMedia.map((media, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentMediaIndex(i)}
                                    className={`w-2 h-2 rounded-full transition-all flex items-center justify-center ${i === currentMediaIndex 
                                        ? 'bg-white w-4' 
                                        : 'bg-white/50'}`}
                                >
                                    {media.type === 'video' && i !== currentMediaIndex && (
                                        <Play className="w-1 h-1 text-white fill-current" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                        <Badge className="bg-blue-600 text-white">{property.transactionType}</Badge>
                        {property.featured && <Badge className="bg-yellow-500 text-white">⭐ Vedette</Badge>}
                        {property.verified && <Badge className="bg-green-500 text-white">✓ Vérifié</Badge>}
                    </div>

                    {/* Media counter */}
                    <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10 flex items-center gap-1">
                        {allMedia[currentMediaIndex].type === 'video' && <Play className="w-3 h-3 fill-current" />}
                        {currentMediaIndex + 1} / {allMedia.length}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title and Price */}
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                                        <span>{property.address}{property.district ? `, ${property.district}` : ''}, {property.city}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleFavoriteClick}
                                        title={isPropertyFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                                    >
                                        <Heart className={`w-5 h-5 transition-colors ${isPropertyFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={handleShare} title="Partager">
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="text-4xl font-bold text-blue-600">
                                {formatPrice(property.price)}
                                {property.transactionType === 'LOCATION' && (
                                    <span className="text-lg text-gray-500 font-normal">/mois</span>
                                )}
                            </div>
                        </div>

                        {/* Key features */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4">Caractéristiques</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Maximize className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <div className="text-xs text-gray-500">Surface</div>
                                            <div className="font-semibold">{property.surface} m²</div>
                                        </div>
                                    </div>
                                    {property.bedrooms && (
                                        <div className="flex items-center gap-2">
                                            <Bed className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <div className="text-xs text-gray-500">Chambres</div>
                                                <div className="font-semibold">{property.bedrooms}</div>
                                            </div>
                                        </div>
                                    )}
                                    {property.bathrooms && (
                                        <div className="flex items-center gap-2">
                                            <Bath className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <div className="text-xs text-gray-500">Salles de bain</div>
                                                <div className="font-semibold">{property.bathrooms}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Home className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <div className="text-xs text-gray-500">Type</div>
                                            <div className="font-semibold">{property.type}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Amenities */}
                        {(property.hasParking || property.hasGarden || property.hasPool || property.isFurnished || property.hasAirCon || property.hasGuardian) && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold mb-4">Équipements</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {property.hasParking && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Car className="w-4 h-4 text-blue-600" /> <span>Parking</span>
                                            </div>
                                        )}
                                        {property.hasGarden && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <TreePine className="w-4 h-4 text-green-600" /> <span>Jardin</span>
                                            </div>
                                        )}
                                        {property.hasPool && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Waves className="w-4 h-4 text-cyan-600" /> <span>Piscine</span>
                                            </div>
                                        )}
                                        {property.isFurnished && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-green-600" /> <span>Meublé</span>
                                            </div>
                                        )}
                                        {property.hasAirCon && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Wind className="w-4 h-4 text-blue-400" /> <span>Climatisation</span>
                                            </div>
                                        )}
                                        {property.hasGuardian && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Shield className="w-4 h-4 text-orange-500" /> <span>Gardien</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Description */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4">Description</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
                            </CardContent>
                        </Card>

                        {/* Reviews Section */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Avis Clients ({reviews.length})</h2>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (!isAuthenticated) toast({ title: "Connexion requise", description: "Connectez-vous pour laisser un avis." });
                                            else setShowReviewForm(!showReviewForm);
                                        }}
                                    >
                                        Écrire un avis
                                    </Button>
                                </div>

                                {showReviewForm && (
                                    <form onSubmit={handleReviewSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg space-y-4">
                                        <div>
                                            <Label>Note globale</Label>
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        type="button"
                                                        key={star}
                                                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                    >
                                                        <Star className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="review-comment">Votre commentaire</Label>
                                            <Textarea
                                                id="review-comment"
                                                rows={3}
                                                required
                                                value={reviewForm.comment}
                                                onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>Annuler</Button>
                                            <Button type="submit" disabled={reviewLoading} className="bg-blue-600 hover:bg-blue-700">
                                                {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Publier'}
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {reviews.length === 0 ? (
                                    <p className="text-gray-500 italic">Aucun avis pour l'instant. Soyez le premier !</p>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.map((review, i) => (
                                            <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                                                        {review.author?.avatar ? (
                                                            <Image src={review.author.avatar.startsWith('http') ? review.author.avatar : `${API_URL}${review.author.avatar}`} alt="Avatar" fill className="object-cover" />
                                                        ) : (
                                                            <span className="flex items-center justify-center h-full text-xs font-bold text-gray-500">
                                                                {review.author?.firstName?.charAt(0)}{review.author?.lastName?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{review.author?.firstName} {review.author?.lastName}</div>
                                                        <div className="flex items-center text-yellow-400">
                                                            {[...Array(5)].map((_, j) => (
                                                                <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="ml-auto text-xs text-gray-400">
                                                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Similar Properties */}
                        {similarProperties.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold mb-4">Propriétés similaires</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {similarProperties.map((prop) => (
                                            <PropertyCard key={prop.id} property={prop} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Contact */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-md">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4">Contacter</h2>

                                {/* Contact Info */}
                                <div className="mb-5 p-4 bg-gray-50 rounded-xl">
                                    <h3 className="font-semibold text-gray-900 mb-1">{contactName}</h3>
                                    {(property.agency as any)?.verified && (
                                        <span className="text-xs text-green-600 font-medium">✓ Agence vérifiée</span>
                                    )}
                                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            {isAuthenticated && contactPhone ? (
                                                <a href={`tel:${contactPhone}`} className="hover:text-blue-600 font-medium">{contactPhone}</a>
                                            ) : (
                                                <span className="text-gray-400 italic">Connectez-vous pour voir le numéro</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {isAuthenticated && contactEmail ? (
                                                <a href={`mailto:${contactEmail}`} className="hover:text-blue-600 truncate">{contactEmail}</a>
                                            ) : (
                                                <span className="text-gray-400 italic">Connectez-vous pour voir l'email</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {!showContactForm && !contactSent ? (
                                    <div className="space-y-3">
                                        {isAuthenticated && contactPhone && (
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                                                <a href={`tel:${contactPhone}`}>
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Appeler
                                                </a>
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    toast({ title: "Connexion requise", description: "Connectez-vous pour envoyer un message.", variant: "destructive" });
                                                } else if (user?.isVerified === false) {
                                                    toast({ title: "Action requise", description: "Veuillez valider votre email pour utiliser cette fonctionnalité.", variant: "destructive" });
                                                    router.push('/dashboard/profile');
                                                } else {
                                                    setShowContactForm(true);
                                                }
                                            }}
                                        >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Envoyer un message
                                        </Button>
                                    </div>
                                ) : contactSent ? (
                                    <div className="text-center py-4">
                                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                        <p className="font-semibold text-gray-900">Message envoyé !</p>
                                        <p className="text-sm text-gray-500 mt-1">Le propriétaire vous contactera bientôt.</p>
                                        <button
                                            className="text-sm text-blue-600 mt-3 hover:underline"
                                            onClick={() => { setContactSent(false); setShowContactForm(false); }}
                                        >
                                            Envoyer un autre message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleContactSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="contact-message">Votre message *</Label>
                                            <Textarea
                                                id="contact-message"
                                                placeholder="Bonjour, je suis intéressé(e) par ce bien..."
                                                rows={4}
                                                value={contactForm.message}
                                                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                                required
                                            />
                                            <div className="flex justify-between mt-1">
                                                <p className="text-[10px] text-gray-400">
                                                    {contactForm.message.length > 0 ? `${contactForm.message.length} caractères` : 'Min. 1 caractère'}
                                                </p>
                                                {contactForm.message.length > 0 && contactForm.message.length < 5 && (
                                                    <p className="text-[10px] text-blue-500 italic">Message court autorisé</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="contact-phone">Votre téléphone (optionnel)</Label>
                                            <Input
                                                id="contact-phone"
                                                placeholder="+221 77 000 00 00"
                                                value={contactForm.phone}
                                                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setShowContactForm(false)}
                                            >
                                                Annuler
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                disabled={contactLoading || !contactForm.message.trim()}
                                            >
                                                {contactLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : 'Envoyer'}
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {/* Property Meta */}
                                <div className="mt-6 pt-4 border-t text-sm text-gray-500 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Référence</span>
                                        <span className="font-mono text-xs">{property.id?.slice(0, 8)}…</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Vues</span>
                                        <span className="font-medium text-gray-700">{property.views}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Publié le</span>
                                        <span>{new Date(property.createdAt).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
