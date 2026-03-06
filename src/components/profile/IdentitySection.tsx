"use client";

import Image from "next/image";
import { Star, MapPin, CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
    DialogTitle,
} from "@/components/ui/dialog";


const GALLERY = [
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&fit=crop",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&fit=crop",
    "https://images.unsplash.com/photo-1599351431202-6e0c03e7d754?q=80&w=800&fit=crop",
];

interface IdentitySectionProps {
    coiffeur: any; // Type efficiently later
}

export function IdentitySection({ coiffeur }: IdentitySectionProps) {
    if (!coiffeur) return null;

    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Avatar */}
                <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-background shadow-lg shrink-0">
                    <Image
                        src="https://placehold.co/400x400/png?text=Profile"
                        alt={coiffeur.firstName}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold text-foreground">{coiffeur.firstName} {coiffeur.lastName}</h1>
                        <Badge variant="secondary" className="w-fit gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                            <CheckCircle2 className="h-3 w-3" /> Diplôme vérifié
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1 font-bold text-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {coiffeur.rating || 5.0} <span className="text-muted-foreground font-normal">(0 avis)</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" /> {coiffeur.city || "Ville inconnue"}
                        </div>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        {coiffeur.bio || "Aucune biographie."}
                    </p>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden mb-4 max-w-md">
                        {GALLERY.slice(0, 3).map((img, i) => (
                            <div key={i} className="relative h-20 w-full cursor-pointer hover:opacity-90 transition-opacity">
                                <Image src={img} alt="Gallery" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
