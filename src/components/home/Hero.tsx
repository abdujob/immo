"use client";

import { SearchBar } from "@/components/property/SearchBar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background with gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
                <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                        Trouvez votre propriété idéale
                        <br />
                        <span className="text-yellow-400">au Sénégal</span>
                    </h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Des milliers d&apos;annonces immobilières pour acheter ou louer votre bien
                    </p>
                </div>

                {/* Search Bar */}
                <SearchBar />

                {/* Quick Links */}
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <Link href="/properties?type=VILLA">
                        <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                            Villas de luxe
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/properties?type=APPARTEMENT&city=Dakar">
                        <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                            Appartements à Dakar
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/properties?type=TERRAIN">
                        <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                            Terrains titrés
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </section>
    );
}
