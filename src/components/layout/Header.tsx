"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, PlusCircle } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">
                        Immo<span className="text-blue-600">Sénégal</span>
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/properties">
                        <Button variant="ghost" className="hidden sm:flex">
                            Annonces
                        </Button>
                    </Link>
                    <Link href="/properties/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Publier
                        </Button>
                    </Link>
                    <Link href="/auth/login">
                        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                            Connexion
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
