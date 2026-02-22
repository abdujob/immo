"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

const TOP_RATED = [
    { id: 1, name: "Alex", city: "Montréal", rating: 4.9, image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=300&auto=format&fit=crop" },
    { id: 2, name: "Sophie", city: "Laval", rating: 4.8, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop" },
    { id: 3, name: "Chris", city: "Longueuil", rating: 4.9, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop" },
    { id: 4, name: "Nadia", city: "Québec", rating: 5.0, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop" },
];

export function TopRated() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOP_RATED.map((pro) => (
                <Link href={`/hairdresser/${pro.id}`} key={pro.id} className="block group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-lg border border-border">
                    {/* Image */}
                    <div className="relative h-48 w-full overflow-hidden">
                        <Image
                            src={pro.image}
                            alt={pro.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{pro.name}</h3>
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-semibold">{pro.rating}</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{pro.city}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
