"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface HairdresserCardProps {
    hairdresser: {
        id: string | number;
        name: string;
        neighborhood: string;
        rating: number;
        reviewCount: number;
        startingPrice: number;
        images: string[];
        isSalon: boolean;
        isHome: boolean;
        isAvailableToday: boolean;
    };
}

export function HairdresserCard({ hairdresser }: HairdresserCardProps) {
    return (
        <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:flex-row">
            {/* Image Carousel */}
            <div className="relative w-full overflow-hidden rounded-lg sm:w-64 shrink-0">
                <Carousel className="w-full">
                    <CarouselContent>
                        {hairdresser.images.map((img, index) => (
                            <CarouselItem key={index}>
                                <div className="relative h-48 w-full sm:h-40">
                                    <Link href={`/hairdresser/${hairdresser.id}`}>
                                        <div className="relative h-full w-full">
                                            <Image
                                                src={img}
                                                alt={`${hairdresser.name} photo ${index + 1}`}
                                                fill
                                                className="object-cover cursor-pointer"
                                            />
                                        </div>
                                    </Link>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 bg-white/80 hover:bg-white" />
                    <CarouselNext className="right-2 bg-white/80 hover:bg-white" />
                </Carousel>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between">
                        <div>
                            <Link href={`/hairdresser/${hairdresser.id}`}>
                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer">
                                    {hairdresser.name}
                                </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {hairdresser.neighborhood}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span className="text-xs font-bold text-primary">{hairdresser.rating}</span>
                            <span className="text-xs text-muted-foreground">({hairdresser.reviewCount})</span>
                        </div>
                    </div>

                    <div className="mt-2 flex gap-2 flex-wrap">
                        {hairdresser.isSalon && (
                            <Badge variant="secondary" className="font-normal">Au salon</Badge>
                        )}
                        {hairdresser.isHome && (
                            <Badge variant="outline" className="font-normal border-green-200 bg-green-50 text-green-700">À domicile</Badge>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Coupe à partir de</span>
                        <span className="text-lg font-bold text-foreground">{hairdresser.startingPrice} €</span>
                    </div>
                    {hairdresser.isAvailableToday && (
                        <Badge className="bg-green-600 hover:bg-green-700 text-white gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            Dispo aujourd&apos;hui
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}
